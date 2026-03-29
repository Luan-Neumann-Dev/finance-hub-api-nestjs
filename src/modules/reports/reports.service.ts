/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  private async calcIncomesForMonth(
    userId: number,
    startOfMonth: Date,
    endOfMonth: Date,
  ): Promise<number> {
    const [oneTime, recurring] = await Promise.all([
      this.prisma.income.aggregate({
        where: {
          userId,
          recurrence: 'none',
          createdAt: { gte: startOfMonth, lte: endOfMonth },
        },
        _sum: { amount: true },
      }),
      this.prisma.income.findMany({
        where: { userId, recurrence: { not: 'none' } },
        select: { amount: true, recurrence: true },
      }),
    ]);

    const oneTimeTotal = Number(oneTime._sum.amount ?? 0);

    const recurringTotal = recurring.reduce((sum, income) => {
      const amount = Number(income.amount);
      switch (income.recurrence) {
        case 'weekly':
          return sum + amount * 4;
        case 'monthly':
          return sum + amount;
        case 'annual':
          return sum + amount / 12;
        default:
          return sum;
      }
    }, 0);

    return oneTimeTotal + recurringTotal;
  }

  async getMonthlyReport(userId: number) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
    );

    const [totalIncomes, expensesAgg, savingsAggs, expensesByCategory] =
      await Promise.all([
        this.calcIncomesForMonth(userId, startOfMonth, endOfMonth),
        this.prisma.expense.aggregate({
          where: { userId, date: { gte: startOfMonth, lte: endOfMonth } },
          _sum: { amount: true },
        }),
        this.prisma.piggyBank.aggregate({
          where: { userId },
          _sum: { balance: true },
        }),
        this.prisma.expense.groupBy({
          by: ['categoryId'],
          where: {
            userId,
            date: { gte: startOfMonth, lte: endOfMonth },
            categoryId: { not: null },
          },
          _sum: { amount: true },
          _count: true,
        }),
      ]);

    const totalExpenses = Number(expensesAgg._sum.amount ?? 0);
    const totalSavings = Number(savingsAggs._sum.balance ?? 0);

    const categoryIds = expensesByCategory.map((e) => e.categoryId!);
    const categories = await this.prisma.expenseCategory.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true, color: true, icon: true },
    });

    const categoryMap = new Map(categories.map((c) => [c.id, c]));

    const expensesByCategoryData = expensesByCategory
      .map((item) => {
        const category = categoryMap.get(item.categoryId!);
        const total = Number(item._sum.amount ?? 0);

        return {
          categoryId: item.categoryId!,
          categoryName: category?.name ?? 'Sem categoria',
          categoryColor: category?.color ?? '#95A5A6',
          categoryIcon: category?.icon ?? 'tag',
          total,
          count: item._count,
          percentage: totalExpenses > 0 ? (total / totalExpenses) * 100 : 0,
        };
      })
      .sort((a, b) => b.total - a.total);

    return {
      totalIncomes,
      totalExpenses,
      balance: totalIncomes - totalExpenses,
      totalSavings,
      expensesByCategory: expensesByCategoryData,
    };
  }

  async getPeriodReport(userId: number, startDate: Date, endDate: Date) {
    const totalMonths =
      (endDate.getFullYear() - startDate.getFullYear()) * 12 +
      (endDate.getMonth() - startDate.getMonth()) +
      1;

    const [oneTimeIncomes, recurringIncomes, expensesAgg, expensesByCategory] =
      await Promise.all([
        this.prisma.income.aggregate({
          where: {
            userId,
            recurrence: 'none',
            createdAt: { gte: startDate, lte: endDate },
          },
          _sum: { amount: true },
        }),
        this.prisma.income.findMany({
          where: { userId, recurrence: { not: 'none' } },
          select: { amount: true, recurrence: true },
        }),
        this.prisma.expense.aggregate({
          where: { userId, date: { gte: startDate, lte: endDate } },
          _sum: { amount: true },
        }),
        this.prisma.expense.groupBy({
          by: ['categoryId'],
          where: {
            userId,
            date: { gte: startDate, lte: endDate },
            categoryId: { not: null },
          },
          _sum: { amount: true },
        }),
      ]);

    const oneTimeTotal = Number(oneTimeIncomes._sum.amount ?? 0);

    const recurringTotal = recurringIncomes.reduce((sum, income) => {
      const amount = Number(income.amount);
      switch (income.recurrence) {
        case 'weekly':
          return sum + amount * 4 * totalMonths;
        case 'monthly':
          return sum + amount * totalMonths;
        case 'annual':
          return sum + (amount / 12) * totalMonths;
        default:
          return sum;
      }
    }, 0);

    const totalIncomes = oneTimeTotal + recurringTotal;
    const totalExpenses = Number(expensesAgg._sum.amount ?? 0);

    const categoryIds = expensesByCategory.map((e) => e.categoryId!);
    const categories = await this.prisma.expenseCategory.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true },
    });
    const categoryMap = new Map(categories.map((c) => [c.id, c]));

    const expensesByDay = await this.prisma.$queryRaw<
      { date: Date; total: number }[]
    >`
      SELECT DATE(date) as date, SUM(amount)::numeric as total
      FROM expenses
      WHERE user_id = ${userId}
        AND date >= ${startDate}
        AND date <= ${endDate}
      GROUP BY DATE(date)
      ORDER BY date
    `;

    return {
      startDate,
      endDate,
      totalIncomes,
      totalExpenses,
      balance: totalIncomes - totalExpenses,
      expensesByCategory: expensesByCategory.map((item) => ({
        categoryId: item.categoryId!,
        categoryName:
          categoryMap.get(item.categoryId!)?.name ?? 'Sem categoria',
        total: Number(item._sum.amount ?? 0),
      })),
      expensesByDay: expensesByDay.map((item) => ({
        date: item.date,
        total: Number(item.total),
      })),
    };
  }

  async getAnnualReport(userId: number, year: number) {
    const monthNames = [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ];

    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31, 23, 59, 59);

    const [allExpenses, oneTimeIncomes, recurringIncomes] = await Promise.all([
      this.prisma.expense.findMany({
        where: { userId, date: { gte: yearStart, lte: yearEnd } },
        select: { amount: true, date: true },
      }),
      this.prisma.income.findMany({
        where: {
          userId,
          recurrence: 'none',
          createdAt: { gte: yearStart, lte: yearEnd },
        },
        select: { amount: true, createdAt: true },
      }),
      this.prisma.income.findMany({
        where: { userId, recurrence: { not: 'none' } },
        select: { amount: true, recurrence: true },
      }),
    ]);

    const expensesByMonth = new Array(12).fill(0);
    for (const expense of allExpenses) {
      const month = new Date(expense.date).getMonth();
      expensesByMonth[month] += Number(expense.amount);
    }

    const oneTimeByMonth = new Array(12).fill(0);
    for (const income of oneTimeIncomes) {
      const month = new Date(income.createdAt).getMonth();
      oneTimeByMonth[month] += Number(income.amount);
    }

    const recurringMonthlyValue = recurringIncomes.reduce((sum, income) => {
      const amount = Number(income.amount);
      switch (income.recurrence) {
        case 'weekly':
          return sum + amount * 4;
        case 'monthly':
          return sum + amount;
        case 'annual':
          return sum + amount / 12;
        default:
          return sum;
      }
    }, 0);

    const monthlyData = Array.from({ length: 12 }, (_, index) => {
      const incomes = oneTimeByMonth[index] + recurringMonthlyValue;
      const expenses = expensesByMonth[index];
      return {
        month: index + 1,
        monthName: monthNames[index],
        incomes,
        expenses,
        balance: incomes - expenses,
      };
    });

    const totalIncomes = monthlyData.reduce((sum, m) => sum + m.incomes, 0);
    const totalExpenses = monthlyData.reduce((sum, m) => sum + m.expenses, 0);

    return {
      year,
      totalIncomes,
      totalExpenses,
      balance: totalIncomes - totalExpenses,
      monthlyData,
    };
  }

  async getMonthComparison(userId: number) {
    const now = new Date();

    const currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentEnd = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
    );

    const previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
    );

    const [currentAgg, previousAgg] = await Promise.all([
      this.prisma.expense.aggregate({
        where: { userId, date: { gte: currentStart, lte: currentEnd } },
        _sum: { amount: true },
      }),
      this.prisma.expense.aggregate({
        where: { userId, date: { gte: previousStart, lte: previousEnd } },
        _sum: { amount: true },
      }),
    ]);

    const current = Number(currentAgg._sum.amount ?? 0);
    const previous = Number(previousAgg._sum.amount ?? 0);
    const difference = current - previous;
    const percentageChange = previous > 0 ? (difference / previous) * 100 : 0;

    return {
      currentMonth: { total: current, month: now.getMonth() + 1 },
      previousMonth: { total: previous, month: now.getMonth() },
      difference,
      percentageChange,
      trend:
        difference > 0 ? 'increase' : difference < 0 ? 'decrease' : 'stable',
    };
  }
}

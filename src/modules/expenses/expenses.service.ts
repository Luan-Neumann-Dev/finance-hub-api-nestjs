import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginatedResult, PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class ExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    userId: number,
    pagination: PaginationDto,
  ): Promise<PaginatedResult<any>> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 10;
    const skip = (page - 1) * limit;

    const [expenses, total] = await Promise.all([
      this.prisma.expense.findMany({
        where: { userId },
        include: { category: true },
        orderBy: { date: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.expense.count({ where: { userId } }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: expenses.map((e) => ({ ...e, amount: Number(e.amount) })),
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasPreviousPage: page > 1,
        hasNextPage: page < totalPages,
      },
    };
  }

  async findById(id: number, userId: number) {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!expense) {
      throw new NotFoundException('Despesa não encontrada');
    }

    if (expense.userId !== userId) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar esta despesa',
      );
    }

    return { ...expense, amount: Number(expense.amount) };
  }

  async findByCategory(categoryId: number, userId: number) {
    const expenses = await this.prisma.expense.findMany({
      where: { userId, categoryId },
      include: { category: true },
      orderBy: { date: 'asc' },
    });

    return expenses.map((e) => ({ ...e, amount: Number(e.amount) }));
  }

  async findByPeriod(userId: number, startDate: Date, endDate: Date) {
    const expenses = await this.prisma.expense.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
      include: { category: true },
      orderBy: { date: 'asc' },
    });

    return expenses.map((e) => ({ ...e, amount: Number(e.amount) }));
  }

  async create(dto: CreateExpenseDto, userId: number) {
    const expense = await this.prisma.expense.create({
      data: {
        userId,
        ...dto,
        date: dto.date ? new Date(dto.date) : new Date(),
      },
      include: { category: true },
    });

    return { ...expense, amount: Number(expense.amount) };
  }

  async update(id: number, dto: UpdateExpenseDto, userId: number) {
    await this.findById(id, userId);

    const expense = await this.prisma.expense.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.date ? { date: new Date(dto.date) } : {}),
      },
      include: { category: true },
    });

    return { ...expense, amount: Number(expense.amount) };
  }

  async delete(id: number, userId: number): Promise<void> {
    await this.findById(id, userId);
    await this.prisma.expense.delete({ where: { id } });
  }

  async pay(id: number, userId: number) {
    await this.findById(id, userId);

    const expense = await this.prisma.expense.update({
      where: { id },
      data: { paidAt: new Date() },
      include: { category: true },
    });

    return { ...expense, amount: Number(expense.amount) };
  }

  async unpay(id: number, userId: number) {
    await this.findById(id, userId);

    const expense = await this.prisma.expense.update({
      where: { id },
      data: { paidAt: null },
      include: { category: true },
    });

    return { ...expense, amount: Number(expense.amount) };
  }

  async findPending(userId: number) {
    const expenses = await this.prisma.expense.findMany({
      where: { userId, paidAt: null },
      include: { category: true },
      orderBy: { date: 'asc' },
    });

    return expenses.map((e) => ({ ...e, amount: Number(e.amount) }));
  }

  async findDueSoon(userId: number, days = 7) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const limit = new Date(today);
    limit.setDate(limit.getDate() + days);

    const expenses = await this.prisma.expense.findMany({
      where: {
        userId,
        paidAt: null,
        date: { gte: today, lte: limit },
      },
      include: { category: true },
      orderBy: { date: 'asc' },
    });

    return expenses.map((e) => ({ ...e, amount: Number(e.amount) }));
  }
}

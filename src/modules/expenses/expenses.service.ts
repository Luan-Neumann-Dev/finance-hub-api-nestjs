import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: number) {
    const expenses = await this.prisma.expense.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { date: 'asc' },
    });

    return expenses.map((e) => ({ ...e, amount: Number(e.amount) }));
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
      data: dto,
      include: { category: true },
    });

    return { ...expense, amount: Number(expense.amount) };
  }

  async delete(id: number, userId: number): Promise<void> {
    await this.findById(id, userId);
    await this.prisma.expense.delete({ where: { id } });
  }
}

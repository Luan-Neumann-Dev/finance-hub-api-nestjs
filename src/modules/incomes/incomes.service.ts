import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class IncomesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: number) {
    const incomes = await this.prisma.income.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });

    return incomes.map((income) => ({
      ...income,
      amount: Number(income.amount),
    }));
  }

  async findById(id: number, userId: number) {
    const income = await this.prisma.income.findUnique({ where: { id } });

    if (!income) {
      throw new NotFoundException('Receita não encontrada');
    }

    if (income.userId !== userId) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar esta receita',
      );
    }

    return { ...income, amount: Number(income.amount) };
  }

  async create(dto: CreateIncomeDto, userId: number) {
    const income = await this.prisma.income.create({
      data: {
        userId,
        ...dto,
        receiveDate: dto.receiveDate ?? 1,
      },
    });

    return { ...income, amount: Number(income.amount) };
  }

  async update(id: number, dto: UpdateIncomeDto, userId: number) {
    await this.findById(id, userId);

    const income = await this.prisma.income.update({
      where: { id },
      data: dto,
    });

    return { ...income, amount: Number(income.amount) };
  }

  async delete(id: number, userId: number): Promise<void> {
    await this.findById(id, userId);
    await this.prisma.income.delete({ where: { id } });
  }
}

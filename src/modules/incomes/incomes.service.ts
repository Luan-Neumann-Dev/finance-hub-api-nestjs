/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginatedResult, PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class IncomesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    userId: number,
    pagination: PaginationDto,
  ): Promise<PaginatedResult<any>> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 10;
    const skip = (page - 1) * limit;

    const where = { userId };

    const [incomes, total] = await Promise.all([
      this.prisma.income.findMany({
        where: { userId },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.income.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: incomes.map((income) => ({
        ...income,
        amount: Number(income.amount),
      })),
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

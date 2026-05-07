/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateInstallmentDto } from './dto/create-installment.dto';
import {
  DeleteInstallmentDto,
  DeleteScope,
  UpdateInstallmentDto,
  UpdateScope,
} from './dto/update-installment.dto';
import { PaginatedResult, PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class InstallmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    userId: number,
    pagination: PaginationDto,
  ): Promise<PaginatedResult<any>> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 10;
    const skip = (page - 1) * limit;

    const where = { userId };

    const [groups, total] = await Promise.all([
      this.prisma.installmentGroup.findMany({
        where: { userId },
        include: {
          category: true,
          expenses: { orderBy: { installmentNumber: 'asc' } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.installmentGroup.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: groups.map((g) => this.serializeGroup(g)),
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

  async create(dto: CreateInstallmentDto, userId: number) {
    const installmentAmount = parseFloat(
      (dto.totalAmount / dto.installments).toFixed(2),
    );

    const lastInstallmentAmount = parseFloat(
      (dto.totalAmount - installmentAmount * (dto.installments - 1)).toFixed(2),
    );

    const firstDate = new Date(dto.firstInstallmentDate + 'T12:00:00');

    const group = await this.prisma.$transaction(async (tx) => {
      const created = await tx.installmentGroup.create({
        data: {
          userId,
          description: dto.description,
          totalAmount: dto.totalAmount,
          installments: dto.installments,
          categoryId: dto.categoryId,
        },
      });

      const expensesData = Array.from({ length: dto.installments }, (_, i) => {
        const date = new Date(firstDate);
        date.setMonth(date.getMonth() + i);

        const amount =
          i === dto.installments - 1
            ? lastInstallmentAmount
            : installmentAmount;

        return {
          userId,
          categoryId: dto.categoryId,
          installmentGroupId: created.id,
          installmentNumber: i + 1,
          description: `${dto.description} ${i + 1}/${dto.installments}`,
          amount,
          date,
        };
      });

      await tx.expense.createMany({ data: expensesData });

      return tx.installmentGroup.findUnique({
        where: { id: created.id },
        include: {
          category: true,
          expenses: { orderBy: { installmentNumber: 'asc' } },
        },
      });
    });

    return this.serializeGroup(group);
  }

  async updateInstallment(
    expenseId: number,
    dto: UpdateInstallmentDto,
    userId: number,
  ) {
    const expense = await this.prisma.expense.findUnique({
      where: { id: expenseId },
    });

    if (!expense) throw new NotFoundException('Parcela não encontrada');
    if (expense.userId !== userId)
      throw new ForbiddenException('Sem permissão');
    if (!expense.installmentGroupId) {
      throw new BadRequestException('Esta despesa não é uma parcela');
    }

    if (dto.scope === UpdateScope.THIS) {
      const updated = await this.prisma.expense.update({
        where: { id: expenseId },
        data: {
          ...(dto.description !== undefined && {
            description: `${dto.description} ${expense.installmentNumber}/${
              (await this.prisma.installmentGroup.findUnique({
                where: { id: expense.installmentGroupId! },
                select: { installments: true },
              }))!.installments
            }`,
          }),
          ...(dto.amount !== undefined && { amount: dto.amount }),
          ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
        },
        include: { category: true },
      });

      return { ...updated, amount: Number(updated.amount) };
    }

    const group = await this.prisma.installmentGroup.findUnique({
      where: { id: expense.installmentGroupId },
    });
    if (!group)
      throw new NotFoundException('Grupo de parcelamento não encontrado');

    await this.prisma.$transaction(async (tx) => {
      const futureExpenses = await tx.expense.findMany({
        where: {
          installmentGroupId: expense.installmentGroupId!,
          installmentNumber: { gte: expense.installmentNumber! },
        },
      });

      for (const fe of futureExpenses) {
        await tx.expense.update({
          where: { id: fe.id },
          data: {
            ...(dto.description !== undefined && {
              description: `${dto.description} ${fe.installmentNumber}/${group.installments}`,
            }),
            ...(dto.amount !== undefined && { amount: dto.amount }),
            ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
          },
        });
      }

      if (dto.description !== undefined || dto.categoryId !== undefined) {
        await tx.installmentGroup.update({
          where: { id: expense.installmentGroupId! },
          data: {
            ...(dto.description !== undefined && {
              description: dto.description,
            }),
            ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
          },
        });
      }
    });

    return { success: true, scope: 'future', expenseId };
  }

  async deleteInstallment(
    expenseId: number,
    dto: DeleteInstallmentDto,
    userId: number,
  ) {
    const expense = await this.prisma.expense.findUnique({
      where: { id: expenseId },
    });

    if (!expense) throw new NotFoundException('Parcela não encontrada');
    if (expense.userId !== userId)
      throw new ForbiddenException('Sem permissão');
    if (!expense.installmentGroupId) {
      throw new BadRequestException('Esta despesa não é uma parcela');
    }

    if (dto.scope === DeleteScope.THIS) {
      await this.prisma.expense.delete({ where: { id: expenseId } });

      const remaining = await this.prisma.expense.count({
        where: { installmentGroupId: expense.installmentGroupId! },
      });
      if (remaining === 0) {
        await this.prisma.installmentGroup.delete({
          where: {
            id: expense.installmentGroupId!,
          },
        });
      }
      return;
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.expense.deleteMany({
        where: {
          installmentGroupId: expense.installmentGroupId!,
          installmentNumber: { gte: expense.installmentNumber! },
        },
      });

      const remaining = await tx.expense.count({
        where: { installmentGroupId: expense.installmentGroupId! },
      });

      if (remaining === 0) {
        await tx.installmentGroup.delete({
          where: { id: expense.installmentGroupId! },
        });
      } else {
        await tx.installmentGroup.update({
          where: { id: expense.installmentGroupId! },
          data: { installments: remaining },
        });
      }
    });
  }

  private serializeGroup(group: any) {
    return {
      ...group,
      totalAmount: Number(group.totalAmount),
      expenses: group.expenses.map((e: any) => ({
        ...e,
        amount: Number(e.amount),
      })),
    };
  }
}

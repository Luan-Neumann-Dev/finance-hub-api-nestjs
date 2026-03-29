/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreatePiggyTransactionDto,
  TransactionType,
} from './dto/create-piggy-transaction.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PiggyTransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: number) {
    const transactions = await this.prisma.piggyTransaction.findMany({
      where: { userId },
      include: { piggyBank: { select: { id: true, name: true } } },
      orderBy: { date: 'desc' },
    });

    return transactions.map((t) => ({ ...t, amount: Number(t.amount) }));
  }

  async findById(id: number, userId: number) {
    const transaction = await this.prisma.piggyTransaction.findUnique({
      where: { id },
      include: { piggyBank: { select: { id: true, name: true } } },
    });

    if (!transaction) {
      throw new NotFoundException('Transação não encontrada');
    }

    if (transaction.userId !== userId) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar esta transação',
      );
    }

    return { ...transaction, amount: Number(transaction.amount) };
  }

  async findByPiggyBank(piggyBankId: number, userId: number) {
    const piggyBank = await this.prisma.piggyBank.findUnique({
      where: { id: piggyBankId },
    });

    if (!piggyBank) throw new NotFoundException('Cofrinho não encontrado');
    if (piggyBank.userId !== userId) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar este cofrinho',
      );
    }

    const transactions = await this.prisma.piggyTransaction.findMany({
      where: { piggyBankId, userId },
      orderBy: { date: 'desc' },
    });

    return transactions.map((t) => ({ ...t, amount: Number(t.amount) }));
  }

  async findDeposits(userId: number) {
    const transactions = await this.prisma.piggyTransaction.findMany({
      where: { userId, type: TransactionType.DEPOSIT },
      include: { piggyBank: { select: { id: true, name: true } } },
      orderBy: { date: 'desc' },
    });

    return transactions.map((t) => ({ ...t, amount: Number(t.amount) }));
  }

  async findWithdrawal(userId: number) {
    const transactions = await this.prisma.piggyTransaction.findMany({
      where: { userId, type: TransactionType.WITHDRAWAL },
      include: { piggyBank: { select: { id: true, name: true } } },
      orderBy: { date: 'desc' },
    });

    return transactions.map((t) => ({ ...t, amount: Number(t.amount) }));
  }

  async create(dto: CreatePiggyTransactionDto, userId: number) {
    const piggyBank = await this.prisma.piggyBank.findUnique({
      where: { id: dto.piggyBankId },
    });

    if (!piggyBank) throw new NotFoundException('Cofrinho não encontrado');
    if (piggyBank.userId !== userId) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar este cofrinho',
      );
    }

    if (dto.type === TransactionType.WITHDRAWAL) {
      if (Number(piggyBank.balance) < dto.amount) {
        throw new BadRequestException('Saldo insuficiente no cofrinho');
      }
    }

    const [transaction] = await this.prisma.$transaction([
      this.prisma.piggyTransaction.create({
        data: {
          userId,
          piggyBankId: dto.piggyBankId,
          type: dto.type,
          amount: dto.amount,
          description: dto.description,
          date: dto.date ? new Date(dto.date) : new Date(),
        },
      }),
      this.prisma.piggyBank.update({
        where: { id: dto.piggyBankId },
        data: {
          balance: {
            increment:
              dto.type === TransactionType.DEPOSIT ? dto.amount : -dto.amount,
          },
        },
      }),
    ]);

    return { ...transaction, amount: Number(transaction.amount) };
  }

  async delete(id: number, userId: number): Promise<void> {
    const transaction = await this.findById(id, userId);

    await this.prisma.$transaction([
      this.prisma.piggyTransaction.delete({ where: { id } }),
      this.prisma.piggyBank.update({
        where: { id: transaction.piggyBankId },
        data: {
          balance: {
            increment:
              transaction.type === TransactionType.DEPOSIT
                ? -transaction.amount
                : transaction.amount,
          },
        },
      }),
    ]);
  }
}

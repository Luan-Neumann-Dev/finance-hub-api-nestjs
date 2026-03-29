/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePiggyBankDto } from './dto/create-piggy-bank.dto';
import { UpdatePiggyBankDto } from './dto/update-piggy-bank.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PiggyBanksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: number) {
    const piggyBanks = await this.prisma.piggyBank.findMany({
      where: { userId },
      include: { transactions: { orderBy: { date: 'desc' } } },
      orderBy: { name: 'asc' },
    });

    return piggyBanks.map((pb) => this.format(pb));
  }

  async findById(id: number, userId: number) {
    const piggyBank = await this.prisma.piggyBank.findUnique({
      where: { id },
      include: { transactions: { orderBy: { date: 'desc' } } },
    });

    if (!piggyBank) {
      throw new NotFoundException('Cofrinho não encontrado');
    }

    if (piggyBank.userId !== userId) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar este cofrinho',
      );
    }

    return this.format(piggyBank);
  }

  async create(dto: CreatePiggyBankDto, userId: number) {
    const piggyBank = await this.prisma.piggyBank.create({
      data: {
        userId,
        ...dto,
        bank: dto.bank ?? 'Outro',
        balance: 0,
      },
      include: { transactions: true },
    });

    return this.format(piggyBank);
  }

  async update(id: number, dto: UpdatePiggyBankDto, userId: number) {
    await this.findById(id, userId);

    const piggyBank = await this.prisma.piggyBank.update({
      where: { id },
      data: dto,
      include: { transactions: true },
    });

    return this.format(piggyBank);
  }

  async delete(id: number, userId: number): Promise<void> {
    const piggyBank = await this.findById(id, userId);

    if (piggyBank.balance !== 0) {
      throw new ConflictException(
        'Não é possível deletar um cofrinho com saldo. Retire todo o dinheiro primeiro',
      );
    }

    await this.prisma.piggyBank.delete({ where: { id } });
  }

  async getTotalSavings(userId: number) {
    const { _sum } = await this.prisma.piggyBank.aggregate({
      where: { userId },
      _sum: { balance: true },
    });

    return { total: Number(_sum.balance ?? 0) };
  }

  private format(piggyBank: any) {
    return {
      ...piggyBank,
      balance: Number(piggyBank.balance),
      transactions: piggyBank.transactions.map((t: any) => ({
        ...t,
        amount: Number(t.amount),
      })),
    };
  }
}

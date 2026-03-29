import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: number) {
    return this.prisma.expenseCategory.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: number, userId: number) {
    const category = await this.prisma.expenseCategory.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    if (category.userId !== userId) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar esta categoria',
      );
    }

    return category;
  }

  async create(dto: CreateCategoryDto, userId: number) {
    return this.prisma.expenseCategory.create({
      data: { ...dto, userId },
    });
  }

  async update(id: number, dto: UpdateCategoryDto, userId: number) {
    await this.findById(id, userId);

    return this.prisma.expenseCategory.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: number, userId: number) {
    await this.findById(id, userId);

    await this.prisma.expenseCategory.delete({ where: { id } });
  }
}

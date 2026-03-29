import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 10;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const { email, password, fullName } = dto;

    const userExists = await this.prisma.user.findUnique({
      where: { email },
    });

    if (userExists) {
      throw new ConflictException('Email já cadastrado');
    }

    const passwordHash = await bcrypt.hash(password, this.SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: { email, passwordHash, fullName },
      select: { id: true, email: true, fullName: true },
    });

    await this.createDefaultCategories(user.id);

    const token = this.jwtService.sign({ userId: user.id });

    return { user, token };
  }

  async login(dto: LoginDto) {
    const { email, password } = dto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário ou senha incorretos');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Usuário ou senha incorretos');
    }

    const token = this.jwtService.sign({ userId: user.id });

    return {
      user: { id: user.id, email: user.email, fullName: user.fullName },
      token,
    };
  }

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  private async createDefaultCategories(userId: number): Promise<void> {
    const defaultCategories = [
      { name: 'Alimentação', color: '#FF6B35', icon: 'utensils' },
      { name: 'Transporte', color: '#4ECDC4', icon: 'car' },
      { name: 'Moradia', color: '#45B7D1', icon: 'home' },
      { name: 'Saúde', color: '#96CEB4', icon: 'heart' },
      { name: 'Lazer', color: '#FFEAA7', icon: 'smile' },
      { name: 'Educação', color: '#A29BFE', icon: 'book' },
      { name: 'Outros', color: '#95A5A6', icon: 'tag' },
    ];

    await this.prisma.expenseCategory.createMany({
      data: defaultCategories.map((category) => ({ userId, ...category })),
    });
  }
}

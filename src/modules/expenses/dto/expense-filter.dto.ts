import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export enum PaymentStatus {
  PAID = 'paid',
  PENDING = 'pending',
}

export class ExpenseFilterDto extends PaginationDto {
  /**
   * Filtra por categoria: ?categoryId=3
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  categoryId?: number;

  /**
   * Filtra por status de pagamento: ?stats=paid
   */
  @IsOptional()
  @IsEnum(PaymentStatus, {
    message: 'status deve ser "paid" ou "pending"',
  })
  status?: PaymentStatus;

  /**
   * Busca parcial por descrição (case-insensitive): ?search=mercado
   */
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;
}

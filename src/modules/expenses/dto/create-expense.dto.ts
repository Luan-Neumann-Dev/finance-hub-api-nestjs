import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateExpenseDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive({ message: 'Valor deve ser positivo' })
  amount: number;

  @IsString()
  @MinLength(1, { message: 'Descrição é obrigatória' })
  @MaxLength(255, { message: 'Descrição muito longa' })
  description: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  categoryId?: number;

  @IsOptional()
  @IsDateString({}, { message: 'Data deve ser uma data válida (ISO 8601)' })
  date?: string;
}

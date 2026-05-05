import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreatePiggyBankDto {
  @IsString()
  @MinLength(1, { message: 'Nome é obrigatório' })
  @MaxLength(255, { message: 'Nome muito longo' })
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Objetivo muito longo' })
  @Transform(({ value }) => value?.trim())
  goal?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Valor meta inválido' })
  @IsPositive({ message: 'Valor meta deve ser positivo' })
  goalAmount?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Nome do banco muito longo' })
  @Transform(({ value }) => value?.trim())
  bank?: string;
}

import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export enum Recurrence {
  NONE = 'none',
  MONTHLY = 'monthly',
  WEEKLY = 'weekly',
  ANNUAL = 'annual',
}

export class CreateIncomeDto {
  @IsString()
  @MinLength(1, { message: 'Nome é obrigatório' })
  @MaxLength(255, { message: 'Nome muito longo' })
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive({ message: 'Valor deve ser positivo' })
  amount: number;

  @IsEnum(Recurrence, {
    message: `Recorrência deve ser: ${Object.values(Recurrence).join(', ')}`,
  })
  recurrence: Recurrence;

  @IsOptional()
  @IsNumber()
  @Min(1, { message: 'Dia deve ser entre 1 e 31' })
  @Max(1, { message: 'Dia deve ser entre 1 e 31' })
  receiveDate?: number;
}

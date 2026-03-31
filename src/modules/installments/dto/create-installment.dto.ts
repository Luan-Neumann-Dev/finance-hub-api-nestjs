import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateInstallmentDto {
  @IsString()
  @MinLength(1, { message: 'Descrição é obrigatória ' })
  @MaxLength(255, { message: 'Descrição muito longa' })
  description: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive({ message: 'Valor total deve ser positivo' })
  totalAmount: number;

  @IsInt({ message: 'Número de parcelas deve ser inteiro' })
  @Min(2, { message: 'Mínimo de 2 parcelas' })
  @Max(60, { message: 'Máximo de 60 parcelas' })
  installments: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  categoryId?: number;

  @IsDateString({}, { message: 'Data deve ser uma data válida (ISO 8601)' })
  firstInstallmentDate: string;
}

import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
}

export class CreatePiggyTransactionDto {
  @IsNumber()
  @IsPositive({ message: 'ID do cofrinho deve ser positivo ' })
  piggyBankId: number;

  @IsEnum(TransactionType, {
    message: `Tipo deve ser: ${Object.values(TransactionType).join(', ')}`,
  })
  type: TransactionType;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive({ message: 'Valor deve ser maior que zero' })
  amount: number;

  @IsOptional()
  @IsDateString({}, { message: 'Data deve ser uma data válida (ISO 8601)' })
  date?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Descrição muito longa' })
  description?: string;
}

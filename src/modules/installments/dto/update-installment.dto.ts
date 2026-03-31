import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export enum UpdateScope {
  THIS = 'this',
  FUTURE = 'future',
}

export class UpdateInstallmentDto {
  @IsEnum(UpdateScope, { message: 'scope deve ser "this" ou "future"' })
  scope: UpdateScope;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  description?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  categoryId?: number;
}

export enum DeleteScope {
  THIS = 'this',
  FUTURE = 'future',
}

export class DeleteInstallmentDto {
  @IsEnum(DeleteScope, { message: 'scope deve ser "this" ou "future" ' })
  scope: DeleteScope;
}

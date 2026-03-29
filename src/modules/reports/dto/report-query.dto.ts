import { Type } from 'class-transformer';
import { IsDateString, IsInt, Max, Min } from 'class-validator';

export class PeriodReportQueryDto {
  @IsDateString({}, { message: 'startDate deve ser uma data válida' })
  startDate: string;

  @IsDateString({}, { message: 'endDate deve ser uma data válida' })
  endDate: string;
}

export class AnnualReportQueryDto {
  @Type(() => Number)
  @IsInt({ message: 'Ano deve ser un número inteiro' })
  @Min(2000, { message: 'Ano deve ser maior que 2000' })
  @Max(2100, { message: 'Ano inválido' })
  year: number;
}

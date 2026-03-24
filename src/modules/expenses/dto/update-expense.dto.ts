import { PartialType } from '@nestjs/mapped-types';
import { CreateExpenseDto } from './create-expense.dto';
import { IsDateString } from 'class-validator';

export class UpdateExpenseDto extends PartialType(CreateExpenseDto) {}

export class PeriodQueryDto {
  @IsDateString({}, { message: 'startDate inválido' })
  startDate: string;

  @IsDateString({}, { message: 'endDate inválido' })
  endDate: string;
}

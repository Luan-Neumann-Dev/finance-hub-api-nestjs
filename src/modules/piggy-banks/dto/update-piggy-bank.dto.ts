import { PartialType } from '@nestjs/mapped-types';
import { CreatePiggyBankDto } from './create-piggy-bank.dto';

export class UpdatePiggyBankDto extends PartialType(CreatePiggyBankDto) {}

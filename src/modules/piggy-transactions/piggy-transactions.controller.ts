import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PiggyTransactionsService } from './piggy-transactions.service';
import { CreatePiggyTransactionDto } from './dto/create-piggy-transaction.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@Controller('piggy-transactions')
export class PiggyTransactionsController {
  constructor(
    private readonly piggyTransactionsService: PiggyTransactionsService,
  ) {}

  @Get()
  findAll(@CurrentUser() userId: number) {
    return this.piggyTransactionsService.findAll(userId);
  }

  @Get('deposits')
  findDeposits(@CurrentUser() userId: number) {
    return this.piggyTransactionsService.findDeposits(userId);
  }

  @Get('withdrawals')
  findWithdrawals(@CurrentUser() userId: number) {
    return this.piggyTransactionsService.findWithdrawal(userId);
  }

  @Get('piggy-bank/:piggyBankId')
  findByPiggyBank(
    @Param('piggyBankId', ParseIntPipe) piggyBankId: number,
    @CurrentUser() userId: number,
  ) {
    return this.piggyTransactionsService.findByPiggyBank(piggyBankId, userId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() userId: number,
  ) {
    return this.piggyTransactionsService.findById(id, userId);
  }

  @Post()
  create(
    @Body() dto: CreatePiggyTransactionDto,
    @CurrentUser() userId: number,
  ) {
    return this.piggyTransactionsService.create(dto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseIntPipe) id: number, @CurrentUser() userId: number) {
    return this.piggyTransactionsService.delete(id, userId);
  }
}

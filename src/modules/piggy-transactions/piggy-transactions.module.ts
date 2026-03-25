import { Module } from '@nestjs/common';
import { PiggyTransactionsService } from './piggy-transactions.service';
import { PiggyTransactionsController } from './piggy-transactions.controller';

@Module({
  controllers: [PiggyTransactionsController],
  providers: [PiggyTransactionsService],
})
export class PiggyTransactionsModule {}

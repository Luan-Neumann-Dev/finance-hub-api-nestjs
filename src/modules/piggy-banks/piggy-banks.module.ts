import { Module } from '@nestjs/common';
import { PiggyBanksService } from './piggy-banks.service';
import { PiggyBanksController } from './piggy-banks.controller';

@Module({
  controllers: [PiggyBanksController],
  providers: [PiggyBanksService],
})
export class PiggyBanksModule {}

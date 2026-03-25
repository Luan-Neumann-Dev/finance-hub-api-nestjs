import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { CategoriesModule } from './modules/categories/categories.module';
import { IncomesModule } from './modules/incomes/incomes.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { PiggyBanksModule } from './modules/piggy-banks/piggy-banks.module';
import { PiggyTransactionsModule } from './modules/piggy-transactions/piggy-transactions.module';
import { ReportsModule } from './modules/reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    CategoriesModule,
    IncomesModule,
    ExpensesModule,
    PiggyBanksModule,
    PiggyTransactionsModule,
    ReportsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

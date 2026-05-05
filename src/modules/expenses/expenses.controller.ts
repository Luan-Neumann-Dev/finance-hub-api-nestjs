import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  Put,
  HttpCode,
  Patch,
  HttpStatus,
} from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { PeriodQueryDto, UpdateExpenseDto } from './dto/update-expense.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ExpenseFilterDto } from './dto/expense-filter.dto';

@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  findAll(@CurrentUser() userId: number, @Query() filters: ExpenseFilterDto) {
    return this.expensesService.findAll(userId, filters);
  }

  @Get('period')
  findByPeriod(@Query() query: PeriodQueryDto, @CurrentUser() userId: number) {
    return this.expensesService.findByPeriod(
      userId,
      new Date(query.startDate),
      new Date(query.endDate),
    );
  }

  @Get('category/:categoryId')
  findByCategory(
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @CurrentUser() userId: number,
  ) {
    return this.expensesService.findByCategory(categoryId, userId);
  }

  @Get('pending')
  findPending(@CurrentUser() userId: number) {
    return this.expensesService.findPending(userId);
  }

  @Get('due-soon')
  findDueSoon(@CurrentUser() userId: number, @Query('days') days?: string) {
    return this.expensesService.findDueSoon(userId, days ? parseInt(days) : 7);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() userId: number,
  ) {
    return this.expensesService.findById(id, userId);
  }

  @Post()
  create(@Body() dto: CreateExpenseDto, @CurrentUser() userId: number) {
    return this.expensesService.create(dto, userId);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateExpenseDto,
    @CurrentUser() userId: number,
  ) {
    return this.expensesService.update(id, dto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseIntPipe) id: number, @CurrentUser() userId: number) {
    return this.expensesService.delete(id, userId);
  }

  @Patch(':id/pay')
  pay(@Param('id', ParseIntPipe) id: number, @CurrentUser() userId: number) {
    return this.expensesService.pay(id, userId);
  }

  @Patch(':id/unpay')
  unpay(@Param('id', ParseIntPipe) id: number, @CurrentUser() userId: number) {
    return this.expensesService.unpay(id, userId);
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { InstallmentsService } from './installments.service';
import { CreateInstallmentDto } from './dto/create-installment.dto';
import {
  DeleteInstallmentDto,
  UpdateInstallmentDto,
} from './dto/update-installment.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('installments')
export class InstallmentsController {
  constructor(private readonly installmentsService: InstallmentsService) {}

  @Get()
  findAll(
    @CurrentUser() userId: number,
    @Query() pagination: PaginationDto
  ) {
    return this.installmentsService.findAll(userId, pagination);
  }

  @Post()
  create(@Body() dto: CreateInstallmentDto, @CurrentUser() userId: number) {
    return this.installmentsService.create(dto, userId);
  }

  @Put('expense/:expenseId')
  updateInstallment(
    @Param('expenseId', ParseIntPipe) expenseId: number,
    @Body() dto: UpdateInstallmentDto,
    @CurrentUser() userId: number,
  ) {
    return this.installmentsService.updateInstallment(expenseId, dto, userId);
  }

  @Delete('expense/:expenseId')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteInstallment(
    @Param('expenseId', ParseIntPipe) expenseId: number,
    @Body() dto: DeleteInstallmentDto,
    @CurrentUser() userId: number,
  ) {
    return this.installmentsService.deleteInstallment(expenseId, dto, userId);
  }
}

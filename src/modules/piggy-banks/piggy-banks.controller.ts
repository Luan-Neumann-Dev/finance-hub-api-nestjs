import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  Put,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PiggyBanksService } from './piggy-banks.service';
import { CreatePiggyBankDto } from './dto/create-piggy-bank.dto';
import { UpdatePiggyBankDto } from './dto/update-piggy-bank.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@Controller('piggy-banks')
export class PiggyBanksController {
  constructor(private readonly piggyBanksService: PiggyBanksService) {}

  @Get()
  findAll(@CurrentUser() userId: number) {
    return this.piggyBanksService.findAll(userId);
  }

  @Get('total-savings')
  getTotalSavings(@CurrentUser() userId: number) {
    return this.piggyBanksService.getTotalSavings(userId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() userId: number,
  ) {
    return this.piggyBanksService.findById(id, userId);
  }

  @Post()
  create(@Body() dto: CreatePiggyBankDto, @CurrentUser() userId: number) {
    return this.piggyBanksService.create(dto, userId);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePiggyBankDto,
    @CurrentUser() userId: number,
  ) {
    return this.piggyBanksService.update(id, dto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseIntPipe) id: number, @CurrentUser() userId: number) {
    return this.piggyBanksService.delete(id, userId);
  }
}

import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import {
  AnnualReportQueryDto,
  PeriodReportQueryDto,
} from './dto/report-query.dto';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('monthly')
  getMonthlyReport(@CurrentUser() userId: number) {
    return this.reportsService.getMonthlyReport(userId);
  }

  @Get('period')
  getPeriodReport(
    @Query() query: PeriodReportQueryDto,
    @CurrentUser() userId: number,
  ) {
    return this.reportsService.getPeriodReport(
      userId,
      new Date(query.startDate),
      new Date(query.endDate),
    );
  }

  @Get('annual')
  getAnnualReport(
    @Query() query: AnnualReportQueryDto,
    @CurrentUser() userId: number,
  ) {
    return this.reportsService.getAnnualReport(userId, query.year);
  }

  @Get('month-comparison')
  getMonthComparison(@CurrentUser() userId: number) {
    return this.reportsService.getMonthComparison(userId);
  }
}

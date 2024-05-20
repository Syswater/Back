import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { Auth } from '../auth/decorators/auth.decorator';
import { Role } from '../constants/role';
import { ReportService } from './report.service';

@Auth(Role.ADMIN)
@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('sales/:routeId/:initDate/:endDate')
  async getSaleReport(
    @Param('routeId', ParseIntPipe) routeId: number,
    @Param('initDate') initDate: string,
    @Param('endDate') endDate: string,
  ) {
    const startDate = new Date(initDate);
    const finishDate = new Date(endDate);
    return await this.reportService.getSaleReportByRoute({
      route_id: routeId,
      initDate: startDate,
      endDate: finishDate,
    });
  }

  @Get('containers/:routeId/:initDate/:endDate')
  async getContainerReport(
    @Param('routeId', ParseIntPipe) routeId: number,
    @Param('initDate') initDate: string,
    @Param('endDate') endDate: string,
  ) {
    const startDate = new Date(initDate);
    const finishDate = new Date(endDate);
    return await this.reportService.getContainerReportByRoute({
      route_id: routeId,
      initDate: startDate,
      endDate: finishDate,
    });
  }

  @Get('expenses/:routeId/:initDate/:endDate')
  async getExpenseReport(
    @Param('routeId', ParseIntPipe) routeId: number,
    @Param('initDate') initDate: string,
    @Param('endDate') endDate: string,
  ) {
    const startDate = new Date(initDate);
    const finishDate = new Date(endDate);
    return await this.reportService.getExpenseReportByRoute({
      route_id: routeId,
      initDate: startDate,
      endDate: finishDate,
    });
  }
}

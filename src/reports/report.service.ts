import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as moment from 'moment';
import { SaleReportByRouteInput } from './dto/sale-report-by-route.input';
import { SaleReport } from './dto/sale-report.output';

@Injectable()
export class ReportService {
  constructor(private readonly prisma: PrismaService) {}

  async getSaleReportByDistribution(
    distribution_id: number,
  ): Promise<SaleReport> {
    const report = await this.prisma.transaction_payment.groupBy({
      by: ['payment_method', 'date'],
      _sum: { value: true },
      where: { sale: { distribution_id } },
    });

    const per_method = report.map((item) => {
      return {
        method: item.payment_method,
        value: item._sum.value,
        date: moment(item.date).format('DD/MM/YYYY'),
      };
    });

    const total = per_method.reduce((a, b) => a + (b.method ? b.value : 0), 0);
    const debt = per_method.reduce((a, b) => a + (!b.method ? b.value : 0), 0);

    const quantitySold = (
      await this.prisma.sale.aggregate({
        _sum: { amount: true },
        where: { distribution_id },
      })
    )._sum.amount;

    return { total, per_method, quantitySold, debt };
  }

  async getSaleReportByRoute(
    input: SaleReportByRouteInput,
  ): Promise<SaleReport> {
    const { route_id, initDate, endDate } = input;
    const report = await this.prisma.transaction_payment.groupBy({
      by: ['payment_method', 'date'],
      _sum: { value: true },
      where: { date: { gte: initDate, lte: endDate }, customer: { route_id } },
    });

    const per_method = report.map((item) => {
      return {
        method: item.payment_method,
        value: item._sum.value,
        date: moment(item.date).format('DD/MM/YYYY'),
      };
    });

    const total = per_method.reduce((a, b) => a + (b.method ? b.value : 0), 0);
    const debt = per_method.reduce((a, b) => a + (!b.method ? b.value : 0), 0);

    const quantitySold = (
      await this.prisma.sale.aggregate({
        _sum: { amount: true },
        where: { customer: { route_id } },
      })
    )._sum.amount;

    return { total, per_method, quantitySold, debt };
  }
}

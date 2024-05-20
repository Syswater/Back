import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as moment from 'moment';
import { ReportByRouteInput } from './dto/report-by-route.input';
import { SaleReport } from './dto/sale-report.output';
import {
  $Enums,
  distribution,
  expense_category,
  product_inventory,
} from '@prisma/client';
import { ExpenseReport } from './dto/expense-report.output';
import { ContainerReport } from './dto/product-inventory-report.output';

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
        date: moment.utc(item.date).format('DD/MM/YYYY'),
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

  async getSaleReportByRoute(input: ReportByRouteInput): Promise<SaleReport> {
    const { route_id, initDate, endDate } = input;
    const report = await this.prisma.transaction_payment.groupBy({
      by: ['payment_method', 'date'],
      _sum: { value: true },
      where: { date: { gte: initDate, lt: endDate }, customer: { route_id } },
    });

    const per_method = report.map((item) => {
      return {
        method: item.payment_method,
        value: item._sum.value,
        date: moment.utc(item.date).format('DD/MM/YYYY'),
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

  async getExpenseReportByDistribution(
    distribution_id: number,
  ): Promise<ExpenseReport> {
    const report = await this.prisma.expense.groupBy({
      by: ['expense_category_id', 'date'],
      _sum: { value: true },
      where: { distribution_id },
    });

    return await this.generateExpenseReport(report);
  }

  async getExpenseReportByRoute(
    input: ReportByRouteInput,
  ): Promise<ExpenseReport> {
    const { route_id, initDate, endDate } = input;
    const report = await this.prisma.expense.groupBy({
      by: ['expense_category_id', 'date'],
      _sum: { value: true },
      where: {
        date: { gte: initDate, lt: endDate },
        distribution: { route_id },
      },
    });

    return await this.generateExpenseReport(report);
  }

  private async generateExpenseReport(report: any[]): Promise<ExpenseReport> {
    const categories: expense_category[] =
      await this.prisma.expense_category.findMany();

    const per_category: {
      category: expense_category;
      value: number;
      date: Date;
    }[] = [];

    for (const category of categories) {
      const item = report.find(
        (x: { expense_category_id: number }) =>
          x.expense_category_id == category.id,
      );
      per_category.push({
        category,
        value: item?._sum.value ?? 0,
        date: item?.date ?? undefined,
      });
    }

    const total = report.reduce(
      (a: any, b: { _sum: { value: any } }) => a + b._sum.value,
      0,
    );
    return { total, per_category };
  }

  async getContainerReportByDistribution(
    distribution_id: number,
  ): Promise<ContainerReport> {
    const distribution: distribution =
      await this.prisma.distribution.findFirstOrThrow({
        where: { id: distribution_id },
      });

    const per_type: {
      id: number;
      product_name: string;
      type: $Enums.transaction_container_type;
      value: number;
      date: Date;
    }[] = [];

    const container_types: product_inventory[] =
      await this.prisma.product_inventory.findMany({
        where: { is_container: 1 },
      });

    for (const type of container_types) {
      const result = await this.prisma.transaction_container.groupBy({
        by: ['type', 'date'],
        _sum: { value: true },
        where: { distribution_id, product_inventory_id: type.id },
      });

      for (const value of result) {
        per_type.push({
          id: type.id,
          product_name: type.product_name,
          type: value.type,
          date: value.date,
          value: value._sum.value,
        });
      }
    }

    const total_borrowed = per_type.reduce(
      (a, b) =>
        a +
        (b.type == $Enums.transaction_container_type.BORROWED ? b.value : 0),
      0,
    );
    const total_returned = per_type.reduce(
      (a, b) =>
        a +
        (b.type == $Enums.transaction_container_type.RETURNED ? b.value : 0),
      0,
    );

    return {
      total_borrowed,
      total_returned,
      total_broken: distribution.broken_containers,
      per_type,
    };
  }

  async getContainerReportByRoute(
    input: ReportByRouteInput,
  ): Promise<ContainerReport> {
    const { route_id, initDate, endDate } = input;

    const per_type: {
      id: number;
      product_name: string;
      type: $Enums.transaction_container_type;
      value: number;
      date: Date;
    }[] = [];

    const container_types: product_inventory[] =
      await this.prisma.product_inventory.findMany({
        where: { is_container: 1 },
      });

    for (const type of container_types) {
      const result = await this.prisma.transaction_container.groupBy({
        by: ['type', 'date'],
        _sum: { value: true },
        where: {
          distribution: { route_id },
          product_inventory_id: type.id,
          date: { gte: initDate, lt: endDate },
        },
      });

      for (const value of result) {
        per_type.push({
          id: type.id,
          product_name: type.product_name,
          type: value.type,
          date: value.date,
          value: value._sum.value,
        });
      }
    }

    const total_borrowed = per_type.reduce(
      (a, b) =>
        a +
        (b.type == $Enums.transaction_container_type.BORROWED ? b.value : 0),
      0,
    );
    const total_returned = per_type.reduce(
      (a, b) =>
        a +
        (b.type == $Enums.transaction_container_type.RETURNED ? b.value : 0),
      0,
    );
    const total_broken: number = (
      await this.prisma.distribution.aggregate({
        _sum: { broken_containers: true },
        where: { route_id },
      })
    )._sum.broken_containers;

    return {
      total_borrowed,
      total_returned,
      total_broken,
      per_type,
    };
  }
}

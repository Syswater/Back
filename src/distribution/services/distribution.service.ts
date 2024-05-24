import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { DistributionDto } from '../dto/distributionDTO/distribution.output';
import { $Enums, Prisma, PrismaClient } from '@prisma/client';
import { Distribution } from '../entities/distribution.entity';
import { CreateDistributionInput } from '../dto/distributionDTO/create-distribution.input';
import { UpdateDistributionInput } from '../dto/distributionDTO/update-distrivution.input';
import { ChangeStatusDistributionInput } from '../dto/distributionDTO/changeStatus-distribution.input';
import {
  DistributionError,
  DistributionErrorCode,
} from 'src/exceptions/distribution-error';
import { RouteDto } from 'src/route/dto/route.output';
import {
  convertWeekdaysToEnum,
  splitWeekdaysString,
} from 'src/constants/weekday';
import { InitDistributionInput } from '../dto/distributionDTO/init-distribution.input';
import { DistributionReport } from '../../reports/dto/distribution-report.output';
import { OpenDistributionInput } from '../dto/distributionDTO/open-distribution.input';
import { CloseDistributionInput } from '../dto/distributionDTO/close-distribution.input';
import { ReportService } from '../../reports/report.service';
import { SaleReport } from '../../reports/dto/sale-report.output';
import { ExpenseReport } from '../../reports/dto/expense-report.output';
import { ContainerReport } from '../../reports/dto/product-inventory-report.output';
import { RouteError, RouteErrorCode } from 'src/exceptions/route-error';
import { ProductError, ProductErrorCode } from 'src/exceptions/product-error';
import { DefaultArgs } from '@prisma/client/runtime/library';

@Injectable()
export class DistributionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reportService: ReportService,
  ) {}

  async getDistribution(search: {
    initDate?: Date;
    finalDate?: Date;
    status?: $Enums.distribution_status[];
    route_id?: number;
    with_route?: boolean;
    distributor_id?: number;
  }): Promise<DistributionDto[]> {
    const {
      initDate,
      finalDate,
      status,
      route_id,
      with_route,
      distributor_id,
    } = search;
    let where = {};
    if (initDate || route_id || status) {
      where = {
        status: { in: status },
        route_id,
        date: this.getDateQuery(initDate, finalDate),
      };
    }

    if (distributor_id) {
      where = {
        ...where,
        distribution_user: { some: { user_id: { equals: distributor_id } } },
      };
    }

    const distributions = await this.prisma.distribution.findMany({
      where,
      select: {
        id: true,
        date: true,
        load_up: true,
        broken_containers: true,
        status: true,
        route_id: true,
        product_inventory_id: true,
        delete_at: true,
        update_at: true,
        route: with_route
          ? {
              select: {
                id: true,
                name: true,
                location: true,
                weekdays: true,
                price: true,
              },
            }
          : undefined,
      },
    });

    return distributions.map((distribution) => {
      const { route, ...info } = distribution;
      return this.getDistributionDto(info, {
        ...route,
        weekdays: route
          ? convertWeekdaysToEnum(splitWeekdaysString(route.weekdays))
          : undefined,
      });
    });
  }

  private getDateQuery(initDate: Date, finalDate: Date) {
    if(initDate){
      if(finalDate){
       return finalDate
        ? { gte: initDate.toISOString(), lte: finalDate.toISOString() }
        : { date: { equals: initDate.toISOString() } }
      }
    }else{
      return {}
    }
  }

  async create(
    distribution: CreateDistributionInput,
  ): Promise<DistributionDto> {
    const { route_id } = distribution;
    const route = await this.prisma.route.findFirst({
      where: { id: distribution.route_id, delete_at: null },
    });
    if (!route)
      throw new RouteError(
        RouteErrorCode.ROUTE_NOT_FOUND,
        `La distribución no se puede crear porque no existe una ruta con el id ${route_id}`,
      );
    const product = await this.prisma.product_inventory.findFirst({
      where: { id: distribution.product_inventory_id, delete_at: null },
    });
    if (!product)
      throw new ProductError(
        ProductErrorCode.PRODUCT_NOT_FOUND,
        `La distribución no se puede crear porque no existe un producto con el id ${distribution.product_inventory_id}`,
      );
    const existingDistribution = await this.prisma.distribution.findFirst({
      where: {
        route_id,
        status: { not: $Enums.distribution_status.CLOSED },
        delete_at: null,
      },
    });
    if (existingDistribution)
      throw new DistributionError(
        DistributionErrorCode.EXISTING_DISTRIBUTION,
        `Ya existe una distribución que no esta cerrada para la ruta dada`,
      );
    const newDistribution = await this.prisma.distribution.create({
      data: distribution,
    });
    return this.getDistributionDto(newDistribution);
  }

  async initDistribution(
    distribution: InitDistributionInput,
  ): Promise<DistributionDto> {
    const { route_id, date } = distribution;
    await this.prisma.route.findFirstOrThrow({
      where: { id: route_id, delete_at: null },
    });
    const existingDistribution = await this.prisma.distribution.findFirst({
      where: {
        route_id,
        status: { not: $Enums.distribution_status.CLOSED },
        delete_at: null,
      },
    });
    if (existingDistribution)
      throw new DistributionError(
        DistributionErrorCode.EXISTING_DISTRIBUTION,
        `Ya existe una distribución que no esta cerrada para la ruta dada`,
      );
    const newDistribution = await this.prisma.distribution.create({
      data: {
        date,
        route_id,
        broken_containers: 0,
        load_up: 0,
        product_inventory_id: 1,
      },
    });
    return this.getDistributionDto(newDistribution);
  }

  async update(
    distribution: UpdateDistributionInput,
  ): Promise<DistributionDto> {
    const { id, ...info } = distribution;
    const updateDistribution = await this.prisma.distribution.update({
      where: { id },
      data: { ...info },
    });
    return this.getDistributionDto(updateDistribution);
  }

  async changeStatus(
    statusInput: ChangeStatusDistributionInput,
  ): Promise<DistributionDto> {
    const { id, status } = statusInput;

    if (status == $Enums.distribution_status.PREORDER)
      throw new DistributionError(
        DistributionErrorCode.STATUS_PREORDER_CHANGE,
        `No se puede cambiar al estado PREORDER`,
      );

    const distribution = await this.prisma.distribution.findFirstOrThrow({
      where: {
        id,
        delete_at: null,
        status: { not: $Enums.distribution_status.CLOSED },
      },
    });

    if (
      distribution.status == $Enums.distribution_status.PREORDER &&
      status != $Enums.distribution_status.OPENED
    )
      throw new DistributionError(
        DistributionErrorCode.STATUS_PREORDER_CHANGE,
        `De estado PREORDER solo se puede cambiar a estado OPENED`,
      );

    if (
      distribution.status == $Enums.distribution_status.OPENED &&
      status != $Enums.distribution_status.CLOSED &&
      status != $Enums.distribution_status.CLOSE_REQUEST
    )
      throw new DistributionError(
        DistributionErrorCode.STATUS_PREORDER_CHANGE,
        `De estado OPENED solo se puede cambiar a estado CLOSED o CLOSE_REQUEST`,
      );

    const updateDistribution = await this.prisma.distribution.update({
      where: { id },
      data: { status },
    });
    if (updateDistribution.status === $Enums.distribution_status.CLOSED) {
      await this.prisma.note.deleteMany({
        where: { distribution_id: updateDistribution.id },
      });
    }
    return this.getDistributionDto(updateDistribution);
  }

  async delete(id: number): Promise<DistributionDto> {
    const distribution = await this.prisma.distribution.findFirst({
      where: { id, delete_at: null },
    });
    if (!distribution) {
      throw new DistributionError(
        DistributionErrorCode.DISTRIBUTION_NOT_FOUND,
        `No existe una distribución con id ${id}`,
      );
    }
    const deletedDistribution = await this.prisma.distribution.delete({
      where: { id },
    });
    return this.getDistributionDto(deletedDistribution);
  }

  private getDistributionDto(
    distribution: Distribution,
    route?: RouteDto,
  ): DistributionDto {
    const { update_at, delete_at, ...info } = distribution;
    return { ...info, route };
  }

  async openDistribution(distribution: OpenDistributionInput) {
    const { distribution_id, distributors_ids, load, product_inventory_id } =
      distribution;
    const users: { user_id: number; distribution_id: number }[] = [];
    for (const user_id of distributors_ids) {
      users.push({ user_id, distribution_id });
    }

    await this.prisma.distribution.update({
      where: { id: distribution_id },
      data: {
        status: 'OPENED',
        load_up: load,
        product_inventory_id,
      },
    });
    try {
      await this.prisma.distribution_user.createMany({ data: users });
    } catch (error) {
      throw new DistributionError(
        DistributionErrorCode.USER_DISTRIBUTION_IS_ALREADY_REGISTERED,
        `Algunos de los usuarios ya están registrados en esta distribución`,
      );
    }
  }

  async closeDistribution(input: CloseDistributionInput) {
    const { distribution_id } = input;
    await this.prisma.$transaction(async (tx) => {
      const distribution = await tx.distribution.update({
        where: { id: distribution_id },
        data: { status: 'CLOSED' },
      });
      await tx.customer.updateMany({
        where: { route_id: distribution.route_id },
        data: { is_served: false },
      });
      await tx.note.deleteMany({
        where: { distribution_id: distribution.id },
      });
      await this.updateContainerInventory(tx, distribution, distribution_id);

      return true;
    });
  }

  private async updateContainerInventory(
    tx: Omit<
      PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
    >,
    distribution: {
      id: number;
      date: Date;
      load_up: number;
      broken_containers: number;
      update_at: Date;
      status: $Enums.distribution_status;
      delete_at: Date;
      route_id: number;
      product_inventory_id: number;
    },
    distribution_id: number,
  ) {
    const containerReport = await this.prisma.transaction_container.groupBy({
      by: ['type'],
      _sum: { value: true },
      where: { distribution_id },
    });

    const total_borrowed = containerReport.reduce(
      (a, b) =>
        a +
        (b.type == $Enums.transaction_container_type.BORROWED
          ? b._sum.value
          : 0),
      0,
    );
    const total_returned = containerReport.reduce(
      (a, b) =>
        a +
        (b.type == $Enums.transaction_container_type.RETURNED
          ? b._sum.value
          : 0),
      0,
    );

    await tx.product_inventory.update({
      where: { id: distribution.product_inventory_id },
      data: {
        amount: {
          increment:
            total_returned - total_borrowed - distribution.broken_containers,
        },
      },
    });
  }

  async getReport(id: number): Promise<DistributionReport> {
    const saleReport: SaleReport =
      await this.reportService.getSaleReportByDistribution(id);
    const expenseReport: ExpenseReport =
      await this.reportService.getExpenseReportByDistribution(id);
    const containerReport: ContainerReport =
      await this.reportService.getContainerReportByDistribution(id);
    const load: number = (
      await this.prisma.distribution.findFirstOrThrow({
        where: { id },
        select: { load_up: true },
      })
    ).load_up;
    return {
      saleReport,
      expenseReport,
      balance: saleReport.total - expenseReport.total,
      containerReport,
      load,
    };
  }
}

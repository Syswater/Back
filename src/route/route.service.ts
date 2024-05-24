import { Injectable } from '@nestjs/common';
import { CreateRouteInput } from './dto/create-route.input';
import { UpdateRouteInput } from './dto/update-route.input copy';
import {
  convertWeekdayEnumToString,
  convertWeekdaysToEnum,
  splitWeekdaysString,
} from '../constants/weekday';
import { RouteDto } from './dto/route.output';
import { RouteError, RouteErrorCode } from '../exceptions/route-error';
import { dbHandleError } from '../exceptions/db_handler';
import { SearchRouteInput } from './dto/search-route.input';
import { RouteStatus } from '../constants/route-status';
import { $Enums } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RouteService {
  constructor(private readonly prisma: PrismaService) {}

  async getRoutes(searchInput: SearchRouteInput): Promise<RouteDto[]> {
    const { filter, whit_status, status } = searchInput;
    let where = await this.applySearchFilter(filter, status);

    const routes = await this.prisma.route.findMany({
      select: {
        id: true,
        name: true,
        location: true,
        weekdays: true,
        price: true,
        distribution: whit_status
          ? {
              select: { status: true, id: true },
              orderBy: { update_at: 'desc' },
              take: 1,
            }
          : undefined,
      },
      where,
    });

    return routes.map((route) => ({
      id: route.id,
      location: route.location,
      name: route.name,
      price: route.price,
      weekdays: convertWeekdaysToEnum(splitWeekdaysString(route.weekdays)),
      status: this.proccessStatusQuery(whit_status, route),
      distribution_id: this.proccessDistributionId(whit_status, route),
    }));
  }

  private proccessDistributionId(whit_status: boolean, route: { id: number; name: string; location: string; weekdays: string; price: number; distribution: { status: $Enums.distribution_status; id: number; }[]; }): number {
    if(whit_status){
      return route.distribution[0]? route.distribution[0].id : undefined
    }else {
      return undefined
    }
  }

  private proccessStatusQuery(whit_status: boolean, route: { distribution: { id: number; status: $Enums.distribution_status; }[]; id: number; name: string; location: string; weekdays: string; price: number; }): RouteStatus {
    if(whit_status){
      return route.distribution[0]
      ? RouteStatus[route.distribution[0].status as keyof typeof RouteStatus]
      : RouteStatus.WHITOUT
    }else{
      return undefined
    }
  }

  private async applySearchFilter(filter: string, status: RouteStatus) {
    let where: {};
    if (filter) {
      where = {
        OR: [
          { name: { contains: filter } },
          { location: { contains: filter } },
        ],
      };
    }

    if (status) {
      const latestStatus = await this.prisma.distribution.groupBy({
        by: ['route_id'],
        _max: {
          update_at: true,
        },
      });

      const latestDistributions = await this.prisma.distribution.findMany({
        where: {
          route_id: {
            in: latestStatus.map((d) => d.route_id),
          },
          update_at: {
            in: latestStatus.map((d) => d._max.update_at),
          },
          status: status as $Enums.distribution_status,
        },
      });
      where = {
        ...where,
        id: { in: latestDistributions.map((d) => d.route_id) },
      };
    }
    return where;
  }

  async create(route: CreateRouteInput): Promise<RouteDto> {
    const { weekdays, ...routeInfo } = route;
    const routeDays: string = convertWeekdayEnumToString(route.weekdays);
    const newRoute = await this.prisma.route.create({
      data: { ...routeInfo, weekdays: routeDays },
    });
    return this.getRouteDto(newRoute);
  }

  async update(route: UpdateRouteInput): Promise<RouteDto> {
    const id: number = route.id;
    const { weekdays, ...routeInfo } = route;
    const routeDays = weekdays
      ? convertWeekdayEnumToString(weekdays)
      : undefined;
    const updated_route = await this.prisma.route.update({
      where: { id },
      data: { ...routeInfo, weekdays: routeDays },
    });
    return this.getRouteDto(updated_route);
  }

  async delete(id: number): Promise<RouteDto> {
    try {
      const route = await this.prisma.route.findFirst({
        where: { id, delete_at: null },
        select: {
          distribution: {
            select: { status: true },
            orderBy: { update_at: 'desc' },
            take: 1,
          },
        },
      });

      if (!route) {
        throw new RouteError(
          RouteErrorCode.ROUTE_NOT_FOUND,
          `No se encuentra la ruta con el id ${id}`,
        );
      } else {
        if (
          route.distribution[0]?.status &&
          route.distribution[0].status != $Enums.distribution_status.CLOSED
        ) {
          throw new RouteError(
            RouteErrorCode.NON_DELETABLE_ROUTE,
            `Para eliminar la ruta, esta debe estar cerrada`,
          );
        }
        const deletedRoute = await this.prisma.route.delete({
          where: { id },
        });
        return this.getRouteDto(deletedRoute);
      }
    } catch (e) {
      dbHandleError(e);
    }
  }

  async getStatus(route_id: number) {
    const status: string = (
      await this.prisma.distribution.findFirst({
        where: { route_id },
        orderBy: { update_at: 'desc' },
      })
    )?.status;
    if (!status) {
      throw new RouteError(
        RouteErrorCode.ROUTE_DOES_NOT_YET_HAVE_DISTRIBUTIONS,
      );
    }
    return status;
  }

  private getRouteDto(routeInfo: {
    id: number;
    name: string;
    location: string;
    weekdays: string;
    price: number;
    update_at: Date;
    delete_at: Date;
  }): RouteDto {
    const { update_at, delete_at, ...info } = routeInfo;
    return {
      ...info,
      weekdays: convertWeekdaysToEnum(splitWeekdaysString(routeInfo.weekdays)),
    };
  }
}

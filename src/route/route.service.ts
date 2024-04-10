import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRouteInput } from './dto/create-route.input';
import { UpdateRouteInput } from './dto/update-route.input copy';
import { convertWeekdayEnumToString, convertWeekdaysToEnum, splitWeekdaysString } from '../constants/weekday';
import { RouteDto } from './dto/route.output';
import { RouteError, RouteErrorCode } from '../exceptions/route-error';
import { dbHandleError } from '../exceptions/db_handler';
import { SearchRouteInput } from './dto/search-route.input';
import { RouteStatus } from '../constants/route-status';

@Injectable()
export class RouteService {

    constructor(private readonly prisma: PrismaService) { }

    async getRoutes(searchInput: SearchRouteInput): Promise<RouteDto[]> {
        const { filter, whit_status } = searchInput;
        let where = this.applySearchFilter(filter);

        const routes = await this.prisma.route.findMany({
            select: {
                id: true,
                name: true,
                location: true,
                weekdays: true,
                price: true,
                distribution: whit_status ? { select: { status: true }, orderBy: { update_at: 'desc' } } : undefined
            }, where
        });

        return routes.map(route => ({
            id: route.id,
            location: route.location,
            name: route.name,
            price: route.price,
            weekdays: convertWeekdaysToEnum(splitWeekdaysString(route.weekdays)),
            status: whit_status ?
                route.distribution[0] ? RouteStatus[route.distribution[0].status as keyof typeof RouteStatus] : RouteStatus.WHITOUT
                : undefined
        }));
    }

    private applySearchFilter(filter: string) {
        let where: {}
        if (filter) {
            where = {
                OR: [
                    { name: { contains: filter } },
                    { location: { contains: filter } }
                ]
            };
        }
        return where;
    }

    async create(route: CreateRouteInput): Promise<RouteDto> {
        const { weekdays, ...routeInfo } = route
        const routeDays: string = convertWeekdayEnumToString(route.weekdays);
        const newRoute = await this.prisma.route.create({ data: { ...routeInfo, weekdays: routeDays } });
        return this.getRouteDto(newRoute)
    }

    async update(route: UpdateRouteInput): Promise<RouteDto> {
        const id: number = route.id;
        const { weekdays, ...routeInfo } = route
        const routeDays = weekdays ? convertWeekdayEnumToString(weekdays) : undefined;
        const updated_route = await this.prisma.route.update({
            where: { id },
            data: { ...routeInfo, weekdays: routeDays }
        })
        return this.getRouteDto(updated_route)
    }

    async delete(id: number): Promise<RouteDto> {
        try {
            const route = await this.prisma.route.findFirst({ where: { id, delete_at: null } });

            if (!route) {
                throw new RouteError(RouteErrorCode.ROUTE_NOT_FOUND, `No se encuentra la ruta con el id ${id}`);
            } else {
                const deletedRoute = await this.prisma.route.delete({
                    where: { id }
                });
                return this.getRouteDto(deletedRoute)
            }
        } catch (e) {
            dbHandleError(e);
        }
    }

    async getStatus(route_id: number) {
        const status: string = (await this.prisma.distribution.findFirst({ where: { route_id }, orderBy: { update_at: 'desc' } }))?.status
        if (!status) {
            throw new RouteError(RouteErrorCode.ROUTE_DOES_NOT_YET_HAVE_DISTRIBUTIONS)
        }
        return status;
    }

    private getRouteDto(routeInfo: {
        id: number; name: string; location: string; weekdays: string; price: number; update_at: Date; delete_at: Date;
    }): RouteDto {
        const { update_at, delete_at, ...info } = routeInfo
        return { ...info, weekdays: convertWeekdaysToEnum(splitWeekdaysString(routeInfo.weekdays)) };
    }

}

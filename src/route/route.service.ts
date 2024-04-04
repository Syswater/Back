import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRouteInput } from './dto/create-route.input';
import { UpdateRouteInput } from './dto/update-route.input copy';
import { convertWeekdayEnumToString, convertWeekdaysToEnum, splitWeekdaysString } from '../constants/weekday';
import { RouteDto } from './dto/route.output';
import { RouteError, RouteErrorCode } from '../exceptions/route-error';
import { dbHandleError } from '../exceptions/db_handler';
import { SearchRouteInput } from './dto/search-route.input';

@Injectable()
export class RouteService {

    constructor(private readonly prisma: PrismaService) { }

    async getRoutes(searchInput: SearchRouteInput): Promise<RouteDto[]> {
        const { filter } = searchInput;

        const routes = await this.prisma.route.findMany({
            select: {
                id: true,
                name: true,
                location: true,
                weekdays: true,
                price: true
            }, where: {
                OR: [
                    { name: { contains: filter } },
                    { location: { contains: filter } }
                ]
            }
        });

        return routes.map(route => ({
            ...route,
            weekdays: convertWeekdaysToEnum(splitWeekdaysString(route.weekdays))
        }));
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
            const user = await this.prisma.route.findFirst({ where: { id, delete_at: null } });

            if (!user) {
                throw new RouteError(RouteErrorCode.ROUTE_NOT_FOUND, "No se encuentra la ruta con el id ${id}");
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

    private getRouteDto(routeInfo: { id: number; name: string; location: string; weekdays: string; price: number; update_at: Date; delete_at: Date; }): RouteDto | PromiseLike<RouteDto> {
        const { update_at, delete_at, ...info } = routeInfo
        return { ...info, weekdays: convertWeekdaysToEnum(splitWeekdaysString(routeInfo.weekdays)) };
    }

}

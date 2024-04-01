import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Route } from './entities/route.entity';
import { route } from '@prisma/client';

@Injectable()
export class RouteService {

    constructor(private readonly prisma:PrismaService){}

    async getRoutes(): Promise<Route[]>{
        return await this.prisma.route.findMany();
    }

    async create(route:Route): Promise<Route>{
        return await this.prisma.route.create({data: route});
    }

    async update(route:Route): Promise<Route>{
        const id:number = route.id;
        return await this.prisma.route.update({
            where: {id},
            data: route
        })
    }

    async delete(id:number): Promise<Route>{
        return this.prisma.route.delete({
            where: {
                id
            }
        })
    }

}

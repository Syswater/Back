import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { RouteService } from './route.service';
import { Route } from './entities/route.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../constants/role';
import { Auth } from '../auth/decorators/auth.decorator';

@Controller('route')
export class RouteController {

    constructor(private readonly routeService: RouteService) { }

    @Auth()
    @Get('findAll')
    async findAll() {
        return await this.routeService.getRoutes();
    }

    @Post('create')
    async create(@Body() route: Route) {
        try {
            const newRoute = await this.routeService.create(route);
            return newRoute;
        } catch (error) {
            throw new BadRequestException("Los datos proporcionados son incorrectos");
        }
    }

    @Put('update')
    async update(@Body() route: Route) {
        try {
            const updatedRoute = await this.routeService.update(route);
            return updatedRoute;
        } catch (error) {
            throw new BadRequestException("Los datos proporcionados son incorrectos");
        }
    }

    @Delete('delete/:id')
    async delete(@Param('id') id: string) {
        try {
            const deletedRoute = await this.routeService.delete(parseInt(id, 10));
            return deletedRoute;
        } catch (error) {
            throw new BadRequestException("Los datos proporcionados son incorrectos");
        }
    }

}

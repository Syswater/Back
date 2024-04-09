import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { RouteService } from './route.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { Role } from '../constants/role';
import { CreateRouteInput } from './dto/create-route.input';
import { UpdateRouteInput } from './dto/update-route.input copy';
import { RouteDto } from './dto/route.output';
import { DeleteRouteDto } from './dto/delete-route.dto';
import { SearchRouteInput } from './dto/search-route.input';
import { GetStatusInput } from './dto/get-status.input';

@Auth()
@Controller('route')
export class RouteController {

    constructor(private readonly routeService: RouteService) { }

    @Get('findAll')
    async findAll(@Body() searchInput: SearchRouteInput): Promise<RouteDto[]> {
        return await this.routeService.getRoutes(searchInput);
    }

    @Auth(Role.ADMIN)
    @Post('create')
    async create(@Body() route: CreateRouteInput): Promise<RouteDto> {
        try {
            const newRoute = await this.routeService.create(route);
            return newRoute;
        } catch (error) {
            throw new BadRequestException("Los datos proporcionados son incorrectos");
        }
    }

    @Auth(Role.ADMIN)
    @Put('update')
    async update(@Body() route: UpdateRouteInput): Promise<RouteDto> {
        try {
            const updatedRoute = await this.routeService.update(route);
            return updatedRoute;
        } catch (error) {
            throw new BadRequestException("Los datos proporcionados son incorrectos");
        }
    }

    @Auth(Role.ADMIN)
    @Delete('delete')
    async delete(@Body() params: DeleteRouteDto): Promise<RouteDto> {
        return await this.routeService.delete(params.id);;

    }


    @Get('status')
    async status(@Body() params: GetStatusInput): Promise<string> {
        return await this.routeService.getStatus(params.id);;
    }

}

import { Controller, Get, Query, Post, Body, BadRequestException, Put, Delete } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderDto } from './dto/order.output';
import { CreateOrderInput } from './dto/create-order.input';
import { UpdateOrderInput } from './dto/update-order.input';
import { DeleteOrderInput } from './dto/delete-order.input';

@Controller('order')
export class OrderController {
    constructor(private readonly orderService: OrderService) { }

    @Get('findAll')
    async findAll(@Query("distribution_id") distribution_id: string): Promise<OrderDto[]> {

        return await this.orderService.getOrders( distribution_id? parseInt(distribution_id) : undefined);
    }

    @Post('create')
    async create(@Body() order: CreateOrderInput): Promise<OrderDto> {
        try {
            const newOrder = await this.orderService.create(order);
            return newOrder;
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    @Put('update')
    async update(@Body() order: UpdateOrderInput): Promise<OrderDto> {
        try {
            const updatedOrder = await this.orderService.update(order);
            return updatedOrder;
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    @Delete('delete')
    async delete(@Body() params: DeleteOrderInput): Promise<OrderDto> {
        return await this.orderService.delete(params.id);;

    }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrderDto } from './dto/order.output';
import { Order } from './entities/order.entity';
import { CreateOrderInput } from './dto/create-order.input';
import { UpdateOrderInput } from './dto/update-order.input';
import { OrderError, OrderErrorCode } from 'src/exceptions/order-error';

@Injectable()
export class OrderService {

    constructor(private readonly prisma: PrismaService) { }

    async getOrders(distribution_id: number): Promise<OrderDto[]> {

        const orders = await this.prisma.order.findMany({
            where: {distribution_id}
        });

        return orders.map(order => this.getOrderDto(order));
    }

    async create(order: CreateOrderInput): Promise<OrderDto> {
        await this.prisma.customer.findFirstOrThrow({where:{id:order.customer_id, delete_at: null}});
        await this.prisma.distribution.findFirstOrThrow({where:{id:order.distribution_id, delete_at: null}});
        const exisitingOrder = await this.prisma.order.findFirst({where:{customer_id: order.customer_id, distribution_id: order.distribution_id, delete_at: null}});
        if(exisitingOrder){
            throw new OrderError(OrderErrorCode.EXISTING_ORDER, `Ya existe una preventa del cliente con id ${order.customer_id} para la distribución con id ${order.distribution_id}`);
        }
        const newOrder = await this.prisma.order.create({ data: order });
        return this.getOrderDto(newOrder);
    }

    async update(order: UpdateOrderInput): Promise<OrderDto> {
        const {id, ...info} = order;
        const updateOrder = await this.prisma.order.update({
            where: { id },
            data: { ...info }
        })
        return this.getOrderDto(updateOrder)
    }

    async delete(id: number): Promise<OrderDto> {
        const order = await this.prisma.order.findFirstOrThrow({ where: { id, delete_at: null } });
        const deletedOrder = await this.prisma.order.delete({
            where: { id }
        });
        return this.getOrderDto(deletedOrder);
    }

    private getOrderDto(order:Order): OrderDto {
        const { update_at, delete_at, ...info } = order
        return { ...info };
    }

}

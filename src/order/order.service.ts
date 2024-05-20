import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrderDto } from './dto/order.output';
import { Order } from './entities/order.entity';
import { CreateOrderInput } from './dto/create-order.input';
import { UpdateOrderInput } from './dto/update-order.input';
import { OrderError, OrderErrorCode } from 'src/exceptions/order-error';
import { CustomerError, CustomerErrorCode } from 'src/exceptions/customer-error';
import { DistributionError, DistributionErrorCode } from 'src/exceptions/distribution-error';

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrders(distribution_id: number): Promise<OrderDto[]> {
    const orders = await this.prisma.order.findMany({
      where: { distribution_id },
    });

    return orders.map((order) => this.getOrderDto(order));
  }

  async create(order: CreateOrderInput): Promise<OrderDto> {
    const customer = await this.prisma.customer.findFirst({
      where: { id: order.customer_id, delete_at: null },
    });
    if(!customer) throw new CustomerError(CustomerErrorCode.CUSTOMER_NOT_FOUND, `No existe un cliente con id ${order.customer_id}`);
    const distribution = await this.prisma.distribution.findFirst({
      where: { id: order.distribution_id, delete_at: null },
    });
    if(!distribution) throw new DistributionError(DistributionErrorCode.DISTRIBUTION_NOT_FOUND, `No existe una distribución con id ${order.distribution_id}`);
    const exisitingOrder = await this.prisma.order.findFirst({
      where: {
        customer_id: order.customer_id,
        distribution_id: order.distribution_id,
        delete_at: null,
      },
    });
    if (exisitingOrder) {
      throw new OrderError(
        OrderErrorCode.EXISTING_ORDER,
        `Ya existe una preventa del cliente con id ${order.customer_id} para la distribución con id ${order.distribution_id}`,
      );
    }
    const newOrder = await this.prisma.order.create({ data: order });
    await this.updateServed(order.customer_id, order.amount);
    return this.getOrderDto(newOrder);
  }

  private async updateServed(customer_id: number, amount: number) {
    if (amount == 0) {
      await this.prisma.customer.update({
        where: { id: customer_id },
        data: { is_served: true },
      });
    }
  }

  async update(order: UpdateOrderInput): Promise<OrderDto> {
    const { id, ...info } = order;
    const value = await this.prisma.order.findFirst({where: {id, delete_at: null}});
    if(!value) throw new OrderError(OrderErrorCode.ORDER_NOT_FOUND, `No existe una orden con id ${id}`)
    const updateOrder = await this.prisma.order.update({
      where: { id },
      data: { ...info },
    });
    await this.updateServed(updateOrder.customer_id, updateOrder.amount);
    return this.getOrderDto(updateOrder);
  }

  async delete(id: number): Promise<OrderDto> {
    const order = await this.prisma.order.findFirst({
      where: { id, delete_at: null },
    });
    if(!order) throw new OrderError(OrderErrorCode.ORDER_NOT_FOUND, `No existe una orden con id ${id}`)
    const deletedOrder = await this.prisma.order.delete({
      where: { id },
    });
    return this.getOrderDto(deletedOrder);
  }

  private getOrderDto(order: Order): OrderDto {
    const { update_at, delete_at, ...info } = order;
    return { ...info };
  }
}

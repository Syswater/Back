import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Customer } from '../entities/customer.entity';
import { CustomerDto } from '../dto/customerDTO/customer.output';
import { CreateCustomerInput } from '../dto/customerDTO/create-customer.input';
import { UpdateCustomerInput } from '../dto/customerDTO/update-customer.input';
import {
    CustomerError,
    CustomerErrorCode,
} from 'src/exceptions/customer-error';
import { NoteDto } from '../dto/noteDTO/note.output';
import { OrderDto } from 'src/order/dto/order.output';
import { SaleDto } from '../../distribution/dto/saleDTO/sale.output';

@Injectable()
export class CustomerService {
    constructor(private readonly prisma: PrismaService) { }

    async getCustomers(options: {
        filter?: string;
        with_notes?: boolean;
        with_order?: boolean;
        distribution_id?: number;
        route_id?: number;
        with_sale?: boolean;
    }): Promise<CustomerDto[]> {
        const {
            filter,
            with_notes,
            with_order,
            distribution_id,
            route_id,
            with_sale,
        } = options;

        if (with_order === true && !distribution_id) {
            throw new CustomerError(
                CustomerErrorCode.DISTRIBUTION_ID_IS_REQUIRED,
                `Si se desea obtener las preordenes es necesario pasar el id de la distribución`,
            );
        }

        if (with_sale === true && !distribution_id) {
            throw new CustomerError(
                CustomerErrorCode.DISTRIBUTION_ID_IS_REQUIRED,
                `Si se desea obtener las ventas es necesario pasar el id de la distribución`,
            );
        }

        let where = {};
        if (filter) {
            where = {
                OR: [
                    { name: { contains: filter } },
                    { cellphone: { contains: filter } },
                    { address: { contains: filter } },
                    { neighborhood: { contains: filter } },
                ],
            };
        }

        let customers = await this.prisma.customer.findMany({
            where: {
                route_id,
                delete_at: null,
                ...where,
            },
            select: {
                id: true,
                address: true,
                neighborhood: true,
                route_order: true,
                tape_preference: true,
                is_contactable: true,
                name: true,
                cellphone: true,
                route_id: true,
                update_at: true,
                delete_at: true,
                note: with_notes
                    ? {
                        select: {
                            id: true,
                            description: true,
                            distribution_id: true,
                            customer_id: true,
                        },
                    }
                    : undefined,
                order: with_order
                    ? {
                        where: { distribution_id, delete_at: null },
                        select: {
                            id: true,
                            amount: true,
                            date: true,
                            tape_type: true,
                            customer_id: true,
                            distribution_id: true,
                        },
                    }
                    : undefined,
                transaction_container: {
                    select: { total: true },
                    orderBy: { id: 'desc' },
                    take: 1,
                },
                sale: with_sale
                    ? {
                        where: { distribution_id, delete_at: null },
                        select: {
                            id: true,
                            amount: true,
                            unit_value: true,
                            customer_id: true,
                            distribution_id: true,
                            user_id: true,
                            product_inventory_id: true,
                            transaction_payment: {
                                select: { total: true },
                                orderBy: { id: 'desc' },
                                take: 1,
                            },
                        },
                    }
                    : undefined,
            },
            orderBy: { route_order: 'asc' },
        });

        const result = await Promise.all(
            customers.map(async (customer) => {
                const { note, order, sale, transaction_container, ...info } = customer;
                const saleDto: SaleDto = sale.length > 0
                    ? {
                        ...sale[0],
                        sale_paid: (
                            await this.prisma.transaction_payment.findFirst({
                                where: { type: 'SALE', sale_id: sale[0].id },
                            })
                        ).value ?? 0
                    }
                    : undefined;
                return this.getCustomerDto({
                    customer: info,
                    note,
                    order: order,
                    totalDebt: sale ? sale[0]?.transaction_payment[0]?.total ?? 0 : 0,
                    borrowedContainers: transaction_container[0]?.total ?? 0,
                    sale: saleDto,
                });
            }),
        );

        return result;
    }

    async create(customer: CreateCustomerInput): Promise<CustomerDto> {
        const route = await this.prisma.route.findFirst({
            where: { id: customer.route_id, delete_at: null },
        });
        if (route) {
            customer.route_order = await this.validateRouteOrder(
                customer.route_order,
                route.id,
            );
            this.updateRouteOrder({
                current_route_order: customer.route_order,
                route_id: route.id,
            });
            const newCustomer = await this.prisma.customer.create({
                data: {
                    ...customer,
                    is_contactable: customer.is_contactable === false ? 0 : 1,
                },
            });
            return this.getCustomerDto({ customer: newCustomer });
        } else {
            throw new CustomerError(CustomerErrorCode.CUSTOMER_ROUTE_NOT_FOUND);
        }
    }

    async update(customer: UpdateCustomerInput): Promise<CustomerDto> {
        const id: number = customer.id;
        const db_customer = await this.prisma.customer.findFirst({
            where: { id, delete_at: null },
        });
        if (!db_customer)
            throw new CustomerError(
                CustomerErrorCode.CUSTOMER_NOT_FOUND,
                `No se encuentra el cliente con el id ${id}`,
            );
        const route = await this.prisma.route.findFirst({
            where: { id: customer.route_id, delete_at: null },
        });
        if (!route)
            throw new CustomerError(CustomerErrorCode.CUSTOMER_ROUTE_NOT_FOUND);
        const past_route_order = db_customer.route_order;
        const past_route_id = db_customer.route_id;
        customer.route_order = await this.validateRouteOrder(
            customer.route_order,
            customer.route_id,
        );
        const updated_customer = await this.prisma.customer.update({
            where: { id },
            data: {
                ...customer,
                is_contactable: customer.is_contactable === false ? 0 : 1,
            },
        });
        if (
            updated_customer.route_id === past_route_id &&
            updated_customer.route_order != past_route_order
        ) {
            this.updateRouteOrder({
                current_route_order: updated_customer.route_order,
                route_id: updated_customer.route_id,
                past_route_order: past_route_order,
                currentId: id,
            });
        }
        if (updated_customer.route_id != past_route_id) {
            this.updateRouteOrder({
                current_route_order: past_route_order,
                route_id: past_route_id,
                isDelete: true,
            });
            this.updateRouteOrder({
                current_route_order: updated_customer.route_order,
                route_id: updated_customer.route_id,
                currentId: id,
            });
        }
        return this.getCustomerDto({ customer: updated_customer });
    }

    async delete(id: number): Promise<CustomerDto> {
        const customer = await this.prisma.customer.findFirst({
            where: { id, delete_at: null },
        });
        if (!customer) {
            throw new CustomerError(
                CustomerErrorCode.CUSTOMER_NOT_FOUND,
                `No se encuentra el cliente con el id ${id}`,
            );
        } else {
            const deletedCustomer = await this.prisma.customer.delete({
                where: { id },
            });
            const nextCustomer = await this.prisma.customer.findFirst({
                where: {
                    route_order: deletedCustomer.route_order + 1,
                    delete_at: null,
                    route_id: deletedCustomer.route_id,
                },
            });
            if (nextCustomer) {
                await this.updateRouteOrder({
                    current_route_order: deletedCustomer.route_order,
                    route_id: nextCustomer.route_id,
                    past_route_order: nextCustomer.route_order,
                    currentId: deletedCustomer.id,
                    isDelete: true,
                });
            }
            return this.getCustomerDto({ customer: deletedCustomer });
        }
    }

    private getCustomerDto(values: {
        customer: Customer;
        note?: NoteDto[];
        order?: OrderDto[];
        totalDebt?: number;
        sale?: SaleDto;
        borrowedContainers?: number;
    }): CustomerDto {
        const { customer, note, order, totalDebt, borrowedContainers, sale } =
            values;
        const { update_at, delete_at, ...info } = customer;
        return {
            ...info,
            is_contactable: customer.is_contactable === 0 ? false : true,
            note,
            order: order ? order[0] : undefined,
            totalDebt,
            borrowedContainers,
            sale,
        };
    }

    async updateRouteOrder(options: {
        current_route_order: number;
        route_id: number;
        past_route_order?: number;
        currentId?: number;
        isDelete?: boolean;
    }) {
        const {
            current_route_order,
            route_id,
            past_route_order,
            currentId,
            isDelete,
        } = options;
        if (isDelete) {
            await this.prisma.customer.updateMany({
                where: {
                    route_order: { gte: current_route_order },
                    id: { not: currentId },
                    delete_at: null,
                    route_id,
                },
                data: { route_order: { decrement: 1 } },
            });
            return;
        }
        if (!past_route_order) {
            await this.prisma.customer.updateMany({
                where: {
                    route_order: { gte: current_route_order },
                    id: { not: currentId },
                    delete_at: null,
                    route_id,
                },
                data: { route_order: { increment: 1 } },
            });
            return;
        }
        if (current_route_order > past_route_order) {
            await this.prisma.customer.updateMany({
                where: {
                    route_order: { lte: current_route_order, gt: past_route_order },
                    id: { not: currentId },
                    delete_at: null,
                    route_id,
                },
                data: { route_order: { decrement: 1 } },
            });
            return;
        }
        await this.prisma.customer.updateMany({
            where: {
                route_order: { gte: current_route_order, lt: past_route_order },
                id: { not: currentId },
                delete_at: null,
                route_id,
            },
            data: { route_order: { increment: 1 } },
        });
    }

    async validateRouteOrder(
        current_route_order: number,
        route_id: number,
    ): Promise<number> {
        const higher = await this.prisma.customer.findFirst({
            where: { route_id, delete_at: null },
            orderBy: { route_order: 'desc' },
            take: 1,
        });
        if (higher) {
            if (current_route_order > higher.route_order) {
                return higher.route_order + 1;
            }
            if (current_route_order < 1) {
                return 1;
            }
        } else {
            current_route_order = 1;
        }

        return current_route_order;
    }

    // async getTotalTransactionValues(customer: CustomerDto): Promise<CustomerDto> {
    //     const debt = await this.prisma.transaction_payment.aggregate({
    //         where: { customer_id: customer.id, type: 'DEBT' },
    //         _sum: { total: true },
    //     });
    //     const paid = await this.prisma.transaction_payment.aggregate({
    //         where: { customer_id: customer.id, type: 'PAID' },
    //         _sum: { total: true },
    //     });
    //     customer.totalDebt = debt._sum.total
    //         ? 0
    //         : paid._sum.total
    //             ? debt._sum.total
    //             : debt._sum.total - paid._sum.total;
    //     console.log('ENTRO: ' + customer.totalDebt);

    //     const borrowed = await this.prisma.transaction_container.aggregate({
    //         where: { customer_id: customer.id, type: 'BORROWED' },
    //         _sum: { total: true },
    //     });
    //     const returned = await this.prisma.transaction_container.aggregate({
    //         where: { customer_id: customer.id, type: 'RETURNED' },
    //         _sum: { total: true },
    //     });
    //     customer.borrowedContainers = borrowed._sum.total
    //         ? 0
    //         : returned._sum.total
    //             ? borrowed._sum.total
    //             : borrowed._sum.total - returned._sum.total;
    //     return customer;
    // }
}

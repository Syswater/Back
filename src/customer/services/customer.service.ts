import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Customer } from '../entities/customer.entity';
import { CustomerDto } from '../dto/customerDTO/customer.output';
import { CreateCustomerInput } from '../dto/customerDTO/create-customer.input';
import { UpdateCustomerInput } from '../dto/customerDTO/update-customer.input';
import { CustomerError, CustomerErrorCode } from 'src/exceptions/customer-error';
import { NoteDto } from '../dto/noteDTO/note.output';

@Injectable()
export class CustomerService {

    constructor(private readonly prisma: PrismaService) { }

    async getCustomers(filter: string, with_notes:boolean, route_id:number): Promise<CustomerDto[]> {
        let where = {};
        if (filter) {
            where = {
                OR: [
                    { name: { contains: filter } },
                    { cellphone: { contains: filter } },
                ]
            }
        }

        let customers = await this.prisma.customer.findMany({
            where: {
                route_id,
                delete_at: null,
                ...where
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
                note: with_notes? {select: {id: true,description: true,distribution_id: true,customer_id: true}} : undefined,
                transaction_payment: {
                    where: {
                        OR: [
                            { type: 'DEBT' },
                            { type: 'SALE' },
                    
                        ]
                    },
                    select: {total: true},
                    orderBy: {id: 'desc'},
                    take: 1
                },
                transaction_container:{
                    select: {total: true},
                    orderBy: {id: 'desc'},
                    take: 1
                }
            },
            orderBy: {route_order: 'asc'}
        });

        return customers.map(customer => {
            const {note, transaction_payment, transaction_container, ...info} = customer;
            return this.getCustomerDto({customer: info, note, totalDebt: transaction_payment[0]?.total, borrowedContainers: transaction_container[0]?.total});
        });
    }

    async create(customer: CreateCustomerInput): Promise<CustomerDto> {
        const route = await this.prisma.route.findFirst({ where: { id: customer.route_id, delete_at: null } })
        if (route) {
            customer.route_order = await this.validateRouteOrder(customer.route_order, route.id);
            this.updateRouteOrder({current_route_order: customer.route_order, route_id: route.id});
            const newCustomer = await this.prisma.customer.create({
                data: {
                    ...customer,
                    is_contactable: customer.is_contactable === false ? 0 : 1
                }
            });
            return this.getCustomerDto({customer:newCustomer});
        } else {
            throw new CustomerError(CustomerErrorCode.CUSTOMER_ROUTE_NOT_FOUND);
        }
    }

    async update(customer: UpdateCustomerInput): Promise<CustomerDto> {
        const id: number = customer.id;
        const db_customer = await this.prisma.customer.findFirst({where:{id}});
        const past_route_order = db_customer.route_order;
        if(db_customer){
            customer.route_order = await this.validateRouteOrder(customer.route_order, db_customer.route_id);
        }
        const updated_customer = await this.prisma.customer.update({
            where: { id },
            data: { ...customer, is_contactable: customer.is_contactable === false ? 0 : 1 }
        });
        if(updated_customer.route_order != past_route_order){
            this.updateRouteOrder({current_route_order:updated_customer.route_order, route_id:updated_customer.route_id, past_route_order: past_route_order, currentId:id});
        }
        return this.getCustomerDto({ customer:updated_customer});
    }

    async delete(id: number): Promise<CustomerDto> {
        const customer = await this.prisma.customer.findFirst({ where: { id, delete_at: null } });
        if (!customer) {
            throw new CustomerError(CustomerErrorCode.CUSTOMER_NOT_FOUND, `No se encuentra el cliente con el id ${id}`);
        } else {
            const deletedCustomer = await this.prisma.customer.delete({
                where: { id }
            });
            const nextCustomer = await this.prisma.customer.findFirst({where:{route_order:deletedCustomer.route_order + 1, delete_at: null, route_id:deletedCustomer.route_id}});
            if(nextCustomer){
                await this.updateRouteOrder({current_route_order:deletedCustomer.route_order, route_id: nextCustomer.route_id, past_route_order:nextCustomer.route_order,currentId:deletedCustomer.id, isDelete:true});
            }

            return this.getCustomerDto({customer: deletedCustomer});
        }
    }

    private getCustomerDto(values: {customer: Customer, note?: NoteDto[], totalDebt?:number, borrowedContainers?:number}): CustomerDto {
        const {customer, note, totalDebt, borrowedContainers} = values;
        const { update_at, delete_at, ...info } = customer;
        return {
            ...info,
            is_contactable: customer.is_contactable === 0 ? false : true,
            note,
            totalDebt,
            borrowedContainers
        };
    }

    async updateRouteOrder(options: {current_route_order:number, route_id:number, past_route_order?:number, currentId?:number, isDelete?:boolean}){
        const {current_route_order, route_id, past_route_order, currentId, isDelete} = options;
        if(isDelete){
            await this.prisma.customer.updateMany({
                where: {route_order: {gte: current_route_order}, id:{not: currentId}, delete_at: null, route_id},
                data:{route_order: {decrement: 1}}
            });
            return;
        }
        if(!past_route_order){
            await this.prisma.customer.updateMany({
                where: { route_order: {gte: current_route_order}, id:{not: currentId}, delete_at: null, route_id},
                data:{route_order: {increment: 1} }
            });
            return;
        }
        if(current_route_order > past_route_order){
            await this.prisma.customer.updateMany({
                where: {route_order: {lte: current_route_order, gt: past_route_order}, id:{not: currentId}, delete_at: null, route_id},
                data:{ route_order: {decrement: 1}}
            });
            return;
        }
        await this.prisma.customer.updateMany({
            where: {route_order: {gte: current_route_order, lt: past_route_order}, id:{not: currentId}, delete_at: null, route_id},
            data:{route_order: {increment: 1}}
        });
    }

    async validateRouteOrder(current_route_order:number ,route_id: number): Promise<number>{
        const higher = await this.prisma.customer.findMany({where: {route_id, delete_at: null}, orderBy: {route_order: 'desc'}, take: 1});
        if(current_route_order > higher[0].route_order){
            return higher[0].route_order + 1;
        }
        if(current_route_order < 1){
            return 1;
        }
        return current_route_order;
    }

    async getTotalTransactionValues(customer:CustomerDto): Promise<CustomerDto>{
        const debt = await this.prisma.transaction_payment.aggregate({
            where: {customer_id: customer.id, type: 'DEBT'}, _sum: {total: true }
        });
        const paid = await this.prisma.transaction_payment.aggregate({
            where: {customer_id: customer.id, type: 'PAID'},
            _sum: {total: true}
        });
        customer.totalDebt = debt._sum.total? 0: paid._sum.total? debt._sum.total: debt._sum.total - paid._sum.total;
        console.log('ENTRO: '+customer.totalDebt)

        const borrowed = await this.prisma.transaction_container.aggregate({
            where: {customer_id: customer.id, type: 'BORROWED'}, _sum: {total: true }
        });
        const returned = await this.prisma.transaction_container.aggregate({
            where: {customer_id: customer.id, type: 'RETURNED'},
            _sum: {total: true}
        });
        customer.borrowedContainers = borrowed._sum.total? 0: returned._sum.total? borrowed._sum.total: borrowed._sum.total - returned._sum.total;
        return customer;
    }

}



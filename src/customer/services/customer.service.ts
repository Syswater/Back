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

    async getCustomers(filter: string, with_notes:boolean): Promise<CustomerDto[]> {
        let where = {}
        if (filter) {
            where = {
                OR: [
                    { name: { contains: filter } },
                    { cellphone: { contains: filter } }
                ]
            }
        }

        const customers = await this.prisma.customer.findMany({
            where,
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
                note: with_notes? {select: {
                    id: true,
                    description: true,
                    distribution_id: true,
                    customer_id: true
                }} : undefined
            }
        });

        return customers.map(customer => 
            this.getCustomerDto({
                id: customer.id,
                address: customer.address,
                neighborhood: customer.neighborhood,
                route_order: customer.route_order,
                tape_preference: customer.tape_preference,
                is_contactable: customer.is_contactable,
                name: customer.name,
                cellphone: customer.cellphone,
                route_id: customer.route_id,
                update_at: customer.update_at,
                delete_at: customer.delete_at,
            }, customer.note)
        );
    }

    async create(customer: CreateCustomerInput): Promise<CustomerDto> {
        const route = await this.prisma.route.findFirst({ where: { id: customer.route_id, delete_at: null } })
        if (route) {
            customer.route_order = await this.validateRouteOrder(customer.route_order, route.id);
            this.updateRouteOrder(customer.route_order);
            const newCustomer = await this.prisma.customer.create({
                data: {
                    ...customer,
                    is_contactable: customer.is_contactable === false ? 0 : 1
                }
            });
            return this.getCustomerDto(newCustomer, []);
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
            data: { ...customer, is_contactable: customer.is_contactable === false ? 0 : 1 },
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
                note: {select: {
                    id: true,
                    description: true,
                    distribution_id: true,
                    customer_id: true
                }}
            }
        });
        if(updated_customer.route_order != past_route_order){
            this.updateRouteOrder(updated_customer.route_order, past_route_order, id);
        }
        return this.getCustomerDto({
            id: updated_customer.id,
            address: updated_customer.address,
            neighborhood: updated_customer.neighborhood,
            route_order: updated_customer.route_order,
            tape_preference: updated_customer.tape_preference,
            is_contactable: updated_customer.is_contactable,
            name: updated_customer.name,
            cellphone: updated_customer.cellphone,
            route_id: updated_customer.route_id,
            update_at: updated_customer.update_at,
            delete_at: updated_customer.delete_at,
        }, updated_customer.note)
    }

    async delete(id: number): Promise<CustomerDto> {
        const customer = await this.prisma.customer.findFirst({ where: { id, delete_at: null } });

        if (!customer) {
            throw new CustomerError(CustomerErrorCode.CUSTOMER_NOT_FOUND, `No se encuentra el cliente con el id ${id}`);
        } else {
            const deletedCustomer = await this.prisma.customer.delete({
                where: { id },
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
                    note: {select: {
                        id: true,
                        description: true,
                        distribution_id: true,
                        customer_id: true
                    }}
                }
            });
            return this.getCustomerDto({
                id: deletedCustomer.id,
                address: deletedCustomer.address,
                neighborhood: deletedCustomer.neighborhood,
                route_order: deletedCustomer.route_order,
                tape_preference: deletedCustomer.tape_preference,
                is_contactable: deletedCustomer.is_contactable,
                name: deletedCustomer.name,
                cellphone: deletedCustomer.cellphone,
                route_id: deletedCustomer.route_id,
                update_at: deletedCustomer.update_at,
                delete_at: deletedCustomer.delete_at,
            }, deletedCustomer.note);
        }
    }

    private getCustomerDto(customer: Customer, note: NoteDto[]): CustomerDto {
        const { update_at, delete_at, ...info } = customer;
        return {
            ...info,
            is_contactable: customer.is_contactable === 0 ? false : true,
            note
        };
    }

    async updateRouteOrder(current_route_order:number, past_route_order?:number, currentId?:number){
        if(!past_route_order){
            await this.prisma.customer.updateMany({
                where: { route_order: {gte: current_route_order}, id:{not: currentId}},
                data:{route_order: {increment: 1} }
            });
            return;
        }
        if(current_route_order > past_route_order){
            await this.prisma.customer.updateMany({
                where: {route_order: {lte: current_route_order, gt: past_route_order}, id:{not: currentId}},
                data:{ route_order: {decrement: 1}}
            });
            return;
        }
        await this.prisma.customer.updateMany({
            where: {route_order: {gte: current_route_order, lt: past_route_order}, id:{not: currentId}},
            data:{route_order: {increment: 1}}
        });
    }

    async validateRouteOrder(current_route_order:number ,route_id: number): Promise<number>{
        const higher = await this.prisma.customer.findMany({where: {route_id}, orderBy: {route_order: 'desc'}, take: 1});
        if(current_route_order > higher[0].route_order){
            return higher[0].route_order + 1;
        }
        if(current_route_order < 1){
            return 1;
        }
        return current_route_order;
    }

}



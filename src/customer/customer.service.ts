import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Customer } from './entities/customer.entity';
import { customer } from '@prisma/client';

@Injectable()
export class CustomerService {

    constructor(private readonly prisma: PrismaService){}

    async getCustomerById(id:number): Promise<Customer>{
        return await this.prisma.customer.findFirst({
            where: {id}
        });
    }

    async getCustomers(): Promise<Customer[]>{
        return await this.prisma.customer.findMany();
    }

    async create(customer:Customer): Promise<Customer>{
        return await this.prisma.customer.create({data: customer});
    }

    async update(customer:Customer): Promise<Customer>{
        const id:number = customer.id;
        return await this.prisma.customer.update({
            where: {id},
            data: customer
        })
    }

    async delete(id:number): Promise<Customer>{
        return this.prisma.customer.delete({
            where: {
                id
            }
        })
    }

}

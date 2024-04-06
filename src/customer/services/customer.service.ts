import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Customer } from '../entities/customer.entity';
import { SearchCustomerInput } from '../dto/customerDTO/search-customer.input';
import { CustomerDto } from '../dto/customerDTO/customer.output';
import { convertTapeToEnum } from 'src/constants/tape_preference';
import { CreateCustomerInput } from '../dto/customerDTO/create-customer.input';
import { UpdateCustomerInput } from '../dto/customerDTO/update-customer.input';
import { CustomerError, CustomerErrorCode } from 'src/exceptions/customer-error';

@Injectable()
export class CustomerService {

    constructor(private readonly prisma: PrismaService){}

    async getCustomers(searchInput: SearchCustomerInput): Promise<CustomerDto[]> {
        let where = {}
        const { filter } = searchInput;
        if (filter) {
            where = {
                OR: [
                    { name: { contains: filter } },
                    { cellphone: { contains: filter } }
                ]
            }
        }

        const customers = await this.prisma.customer.findMany({
            where
        });
        return customers.map(customer => this.getCustomerDto(customer));
    }

    async create(customer: CreateCustomerInput): Promise<CustomerDto> {
        const newCustomer = await this.prisma.customer.create({
            data:{
                ...customer,
                is_contactable: customer.is_contactable === false? 0:1
            }
        })
        return this.getCustomerDto(newCustomer);
    }

    async update(customer: UpdateCustomerInput): Promise<CustomerDto> {
        const id: number = customer.id;
        const updated_customer = await this.prisma.customer.update({
            where: { id },
            data: { ...customer, is_contactable: customer.is_contactable === false? 0:1 }
        })
        return this.getCustomerDto(updated_customer)
    }

    async delete(id: number): Promise<CustomerDto> {
        const customer = await this.prisma.customer.findFirst({ where: { id, delete_at: null } });

        if (!customer) {
            throw new CustomerError(CustomerErrorCode.CUSTOMER_NOT_FOUND, `No se encuentra el cliente con el id ${id}`);
        } else {
            const deletedCustomer = await this.prisma.customer.delete({
                where: { id }
            });
            return this.getCustomerDto(deletedCustomer);
        }
    }

    private getCustomerDto(customer: Customer): CustomerDto {
        const { update_at, delete_at, ...info } = customer;
        return {
            ...info,
            tape_preference: convertTapeToEnum(customer.tape_preference),
            is_contactable: customer.is_contactable === 0? false:true
        };
    }

}

import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { CustomerService } from '../services/customer.service';
import { SearchCustomerInput } from '../dto/customerDTO/search-customer.input';
import { CustomerDto } from '../dto/customerDTO/customer.output';
import { CreateCustomerInput } from '../dto/customerDTO/create-customer.input';
import { UpdateCustomerInput } from '../dto/customerDTO/update-customer.input';
import { DeleteCustomerInput } from '../dto/customerDTO/delete-customer.input';
import { Auth } from 'src/auth/decorators/auth.decorator';

@Auth()
@Controller('customer')
export class CustomerController {

    constructor(private readonly customerService: CustomerService) { }

    @Get('findAll')
    async findAll(@Query("filter") filter: string, @Query("with_notes") with_notes: string, @Query("route_id") route_id: string): Promise<CustomerDto[]> {
        return await this.customerService.getCustomers(filter, with_notes?.toLowerCase() === 'true', parseInt(route_id, 10));
    }

    @Post('create')
    async create(@Body() customer: CreateCustomerInput): Promise<CustomerDto> {
        try {
            const newCustomer = await this.customerService.create(customer);
            return newCustomer;
        } catch (error) {
            throw error;
        }
    }

    @Put('update')
    async update(@Body() customer: UpdateCustomerInput): Promise<CustomerDto> {
        try {
            const updatedCustomer = await this.customerService.update(customer);
            return updatedCustomer;
        } catch (error) {
            throw new BadRequestException("Los datos proporcionados son incorrectos");
        }
    }

    @Delete('delete')
    async delete(@Body() params: DeleteCustomerInput): Promise<CustomerDto> {
        const deletedCustomer = await this.customerService.delete(params.id);
        return deletedCustomer;
    }

}

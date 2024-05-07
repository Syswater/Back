import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Query,
} from '@nestjs/common';
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
    async findAll(
        @Query('filter') filter?: string,
        @Query('with_notes') with_notes?: string,
        @Query('with_order') with_order?: string,
        @Query('with_sale') with_sale?: string,
        @Query('distribution_id') distribution_id?: string,
        @Query('route_id') route_id?: string,
    ): Promise<CustomerDto[]> {
        return await this.customerService.getCustomers({
            filter,
            with_notes: with_notes?.toLowerCase() === 'true',
            with_order: with_order?.toLowerCase() === 'true',
            distribution_id: parseInt(distribution_id, 10),
            route_id: route_id ? parseInt(route_id, 10) : undefined,
            with_sale: with_sale?.toLowerCase() === 'true',
        });
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
            throw new BadRequestException(error);
        }
    }

    @Delete('delete')
    async delete(@Body() params: DeleteCustomerInput): Promise<CustomerDto> {
        const deletedCustomer = await this.customerService.delete(params.id);
        return deletedCustomer;
    }
}

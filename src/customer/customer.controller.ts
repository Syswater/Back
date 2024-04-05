import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { Route } from 'src/route/entities/route.entity';
import { Customer } from './entities/customer.entity';

@Controller('customer')
export class CustomerController {

    constructor(private readonly customerService: CustomerService){}
    
    @Get('findAll')
    async findAll(){
        return await this.customerService.getCustomers();
    }

    @Post('create')
    async create(@Body() customer:Customer){
        try {
            const newCustomer = await this.customerService.create(customer);
            return newCustomer;
        } catch (error) {
            throw new BadRequestException("Los datos proporcionados son incorrectos");
        }
    }

    @Put('update')
    async update(@Body() customer:Customer){
        try {
            const updatedCustomer = await this.customerService.update(customer);
            return updatedCustomer;
        } catch (error) {
            throw new BadRequestException("Los datos proporcionados son incorrectos");
        }
    }

    @Delete('delete/:id')
    async delete(@Param('id') id:string){
        try {
            const deletedCustomer = await this.customerService.delete(parseInt(id, 10));
            return deletedCustomer;
        } catch (error) {
            throw new BadRequestException("Los datos proporcionados son incorrectos");
        }
    }

}

import { BadRequestException, Controller, Get, Query, Post, Body, Put, Delete } from '@nestjs/common';
import { SaleDto } from "../dto/saleDTO/sale.output";
import { SaleService } from '../services/sale.service';
import { CreateSaleInput } from '../dto/saleDTO/create-sale.input';
import { UpdateSaleInput } from '../dto/saleDTO/update-sale.input';
import { DeleteSaleInput } from '../dto/saleDTO/delete-sale.input';

@Controller('sale')
export class SaleController{

    constructor(private readonly saleService:SaleService){}

    @Get('findAll')
    async findAll(
        @Query('distribution_id') distribution_id?:string,
        @Query('route_id') route_id?:string,
        @Query('initDate') initDate?:string,
        @Query('finalDate') finalDate?:string,
        @Query('customer_id') customer_id?:string,
    ):Promise<SaleDto[]>{
        try {
            return this.saleService.getSales(
                {
                    distribution_id: distribution_id? parseInt(distribution_id):undefined,
                    route_id: route_id? parseInt(route_id):undefined,
                    initDate: initDate? new Date(initDate): undefined, // yyyy-mm-dd
                    finalDate: finalDate? new Date(finalDate): undefined,
                    customer_id: customer_id? parseInt(customer_id):undefined
                }
            )
        } catch (error) {
            throw new BadRequestException("Los datos proporcionados son incorrectos");
        }
    }


    @Post('create')
    async create(@Body() sale: CreateSaleInput): Promise<SaleDto> {
        // try {
            const newSale = await this.saleService.create(sale);
            return newSale;
        // } catch (error) {
        //     throw new BadRequestException("Los datos proporcionados son incorrectos");
        // }
    }

    @Put('update')
    async update(@Body() sale: UpdateSaleInput): Promise<SaleDto> {
        try {
            const updatedSale = await this.saleService.update(sale);
            return updatedSale;
        } catch (error) {
            throw new BadRequestException("Los datos proporcionados son incorrectos");
        }
    }

    @Delete('delete')
    async delete(@Body() params: DeleteSaleInput): Promise<SaleDto> {
        return await this.saleService.delete(params.id);
    }


}
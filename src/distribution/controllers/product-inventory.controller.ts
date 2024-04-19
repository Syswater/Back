import { BadRequestException, Body, Controller, Delete, Get, Post, Put } from "@nestjs/common";
import { ProductInventoryService } from '../services/product-inventory.service';
import { ProductInventoryDto } from '../dto/productDTO/product.output';
import { CreateProductInput } from "../dto/productDTO/create-product.input";
import { UpdateProductInput } from "../dto/productDTO/update-product.input";
import { DeleteProductInput } from "../dto/productDTO/delete-product.input";

@Controller('product')
export class ProductInventoryController{

    constructor(private readonly productService:ProductInventoryService){}

    @Get('findAll')
    async findAll():Promise<ProductInventoryDto[]>{
        try {
            return this.productService.getProducts();
        } catch (error) {
            throw new BadRequestException("Los datos proporcionados son incorrectos");
        }
    }


    @Post('create')
    async create(@Body() product: CreateProductInput): Promise<ProductInventoryDto> {
        try {
            const newProduct= await this.productService.create(product);
            return newProduct;
        } catch (error) {
            throw new BadRequestException("Los datos proporcionados son incorrectos");
        }
    }

    @Put('update')
    async update(@Body() product: UpdateProductInput): Promise<ProductInventoryDto> {
        try {
            const updatedProduct = await this.productService.update(product);
            return updatedProduct;
        } catch (error) {
            throw new BadRequestException("Los datos proporcionados son incorrectos");
        }
    }

    @Delete('delete')
    async delete(@Body() params: DeleteProductInput): Promise<ProductInventoryDto> {
        return await this.productService.delete(params.id);
    }

}
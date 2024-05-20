import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { ProductInventoryDto } from "../dto/productDTO/product.output";
import { ProductInventory } from "../entities/product-inventory.entity";
import { CreateProductInput } from "../dto/productDTO/create-product.input";
import { UpdateProductInput } from "../dto/productDTO/update-product.input";
import { ProductError, ProductErrorCode } from "src/exceptions/product-error";

@Injectable()
export class ProductInventoryService{

    constructor(private readonly prisma: PrismaService) { }

    async getProducts(): Promise<ProductInventoryDto[]> {
        const products = await this.prisma.product_inventory.findMany({where:{}});
        return products.map(product => this.getProductDto(product));
    }

    async create(product: CreateProductInput): Promise<ProductInventoryDto> {
        const {is_container, ...info} = product;
        const newProduct = await this.prisma.product_inventory.create({ data: {...info, is_container: is_container?1:0} });
        return this.getProductDto(newProduct);
    }

    async update(product: UpdateProductInput): Promise<ProductInventoryDto> {
        const {id, is_container, ...info} = product;
        const value = await this.prisma.product_inventory.findFirst({where: {id, delete_at: null}});
        if(!value) throw new ProductError(ProductErrorCode.PRODUCT_NOT_FOUND, `No existe un producto con id ${id}`);
        const updateProduct = await this.prisma.product_inventory.update({
            where: { id },
            data: { ...info, is_container: is_container?1:0 }
        })
        return this.getProductDto(updateProduct)
    }

    async delete(id: number): Promise<ProductInventoryDto> {
        const product = await this.prisma.product_inventory.findFirst({ where: { id, delete_at: null } });
        if(!product) throw new ProductError(ProductErrorCode.PRODUCT_NOT_FOUND, `No existe un producto con id ${id}`);
        const deletedProduct = await this.prisma.product_inventory.delete({
            where: { id }
        });
        return this.getProductDto(deletedProduct);
    }

    private getProductDto(product:ProductInventory): ProductInventoryDto {
        const { is_container, update_at, delete_at, ...info } = product;
        return { ...info, is_container: is_container === 0? false:true };
    }

}
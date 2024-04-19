import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { SaleDto } from "../dto/saleDTO/sale.output";
import { Sale } from "../entities/sale.entity";
import { CreateSaleInput } from "../dto/saleDTO/create-sale.input";
import { UpdateSaleInput } from "../dto/saleDTO/update-sale.input";

@Injectable()
export class SaleService{

    constructor(private readonly prisma: PrismaService) { }

    async getSales(search: {initDate?:Date, finalDate?:Date, distribution_id?:number, route_id?:number}): Promise<SaleDto[]> {
        const { initDate, finalDate, distribution_id, route_id } = search;
        const where = {
            OR: [
                {distribution_id},
                initDate? {
                    distribution: {
                        OR: [
                            {route_id},
                            finalDate
                                ? { date: { gte: initDate.toISOString(), lte: finalDate.toISOString() } }
                                : { date: { equals: initDate.toISOString()} },
                        ]
                    }
                }:{ distribution: {
                        route_id
                    }
                }
            ]
        };
    
        const sales = await this.prisma.sale.findMany({
            where,
        });
    
        return sales.map(sale => this.getSaleDto(sale));
    }

    async create(sale: CreateSaleInput): Promise<SaleDto> {
        await this.prisma.customer.findFirstOrThrow({where:{id:sale.customer_id, delete_at: null}});
        await this.prisma.distribution.findFirstOrThrow({where:{id:sale.distribution_id, delete_at: null}});
        await this.prisma.user.findFirstOrThrow({where:{id:sale.user_id, delete_at: null}});
        await this.prisma.product_inventory.findFirstOrThrow({where:{id:sale.product_inventory_id, delete_at: null}});
        const newSale = await this.prisma.sale.create({ data: sale });
        return this.getSaleDto(newSale);
    }

    async update(sale: UpdateSaleInput): Promise<SaleDto> {
        const {id, ...info} = sale;
        const updateSale = await this.prisma.sale.update({
            where: { id },
            data: { ...info }
        })
        return this.getSaleDto(updateSale)
    }

    async delete(id: number): Promise<SaleDto> {
        const sale = await this.prisma.sale.findFirstOrThrow({ where: { id, delete_at: null } });
        const deletedSale = await this.prisma.sale.delete({
            where: { id }
        });
        return this.getSaleDto(deletedSale);
    }

    private getSaleDto(sale:Sale): SaleDto {
        const { update_at, delete_at, ...info } = sale
        return { ...info };
    }

}
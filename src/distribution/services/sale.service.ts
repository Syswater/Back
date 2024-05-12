import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { SaleDto } from "../dto/saleDTO/sale.output";
import { Sale } from '../entities/sale.entity';
import { CreateSaleInput } from "../dto/saleDTO/create-sale.input";
import { UpdateSaleInput } from "../dto/saleDTO/update-sale.input";
import { TransactionPaymentService } from "src/transaction/services/transaction-payment.service";
import * as moment from "moment";
import { $Enums } from '@prisma/client';

@Injectable()
export class SaleService{

    constructor(private readonly prisma: PrismaService, private readonly transactionPaymentService: TransactionPaymentService) { }

    async getSales(search: {initDate?:Date, finalDate?:Date, distribution_id?:number, route_id?:number, customer_id?: number}): Promise<SaleDto[]> {
        const { initDate, finalDate, distribution_id, route_id, customer_id } = search;
        const where = {
            OR: [
                {distribution_id},
                {customer_id},
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
        const { payment_method, ...info} = sale;
        await this.prisma.customer.findFirstOrThrow({where:{id:sale.customer_id, delete_at: null}});
        await this.prisma.distribution.findFirstOrThrow({where:{id:sale.distribution_id, delete_at: null}});
        await this.prisma.user.findFirstOrThrow({where:{id:sale.user_id, delete_at: null}});
        await this.prisma.product_inventory.findFirstOrThrow({where:{id:sale.product_inventory_id, delete_at: null}});
        const newSale = await this.prisma.sale.create({ data: {...info} });
        await this.updateTransactionsPayment({value: sale.amount * sale.unit_value, value_paid: sale.value_paid, payment_method: sale.payment_method, customer_id: sale.customer_id, user_id: sale.user_id, sale_id: newSale.id});
        return this.getSaleDto(newSale);
    }

    async update(sale: UpdateSaleInput): Promise<SaleDto> {
        const {id, ...info} = sale;
        await this.prisma.sale.findFirstOrThrow({ where: { id, delete_at: null } });
        const updateSale = await this.prisma.sale.update({
            where: { id },
            data: { ...info }
        })
        await this.updateTransactionsPayment({value: updateSale.amount * updateSale.unit_value, value_paid: updateSale.value_paid, payment_method: sale.payment_method, customer_id: updateSale.customer_id, user_id: updateSale.user_id, sale_id: updateSale.id});
        return this.getSaleDto(updateSale);
    }

    async delete(id: number): Promise<SaleDto> {
        await this.prisma.sale.findFirstOrThrow({ where: { id, delete_at: null } });
        const deletedSale = await this.prisma.sale.delete({
            where: { id }
        });
        return this.getSaleDto(deletedSale);
    }

    private getSaleDto(sale:Sale): SaleDto {
        const { update_at, delete_at, ...info } = sale
        return { ...info };
    }

    async updateTransactionsPayment(values: {value:number, value_paid:number, payment_method?: $Enums.transaction_payment_payment_method, customer_id:number, user_id:number, sale_id: number}) {
        let {value, value_paid, payment_method, customer_id, user_id, sale_id} = values;
        if(!payment_method){
            payment_method = (await this.prisma.transaction_payment.findFirstOrThrow({where:{ sale_id, type: $Enums.transaction_payment_type.PAID}})).payment_method;
        }
        await this.prisma.transaction_payment.deleteMany({where: {sale_id}});
        const date = moment().startOf('day').toDate();
        if( value > value_paid){
            await this.transactionPaymentService.create({date, value, type: $Enums.transaction_payment_type.DEBT, payment_method: null, customer_id, user_id, sale_id});
            if(value_paid !== 0) await this.transactionPaymentService.create({date, value: value_paid, type: $Enums.transaction_payment_type.PAID, payment_method, customer_id, user_id, sale_id});
        }
        if( value === value_paid){
            await this.transactionPaymentService.create({date, value, type: $Enums.transaction_payment_type.SALE, payment_method: payment_method, customer_id, user_id, sale_id});
        }
    }

}
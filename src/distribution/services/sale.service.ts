import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SaleDto } from '../dto/saleDTO/sale.output';
import { Sale } from '../entities/sale.entity';
import { CreateSaleInput } from '../dto/saleDTO/create-sale.input';
import { UpdateSaleInput } from '../dto/saleDTO/update-sale.input';
import { TransactionPaymentService } from 'src/transaction/services/transaction-payment.service';
import * as moment from 'moment';
import { $Enums } from '@prisma/client';
import { SaleReport } from 'src/reports/dto/sale-report.output';
import { CustomerError, CustomerErrorCode } from 'src/exceptions/customer-error';
import { DistributionError, DistributionErrorCode } from 'src/exceptions/distribution-error';
import { UserError, UserErrorCode } from 'src/exceptions/user-error';
import { ProductError, ProductErrorCode } from 'src/exceptions/product-error';
import { SaleError, SaleErrorCode } from 'src/exceptions/sale-error';

@Injectable()
export class SaleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly transactionPaymentService: TransactionPaymentService,
  ) {}

  async getSales(search: {
    initDate?: Date;
    finalDate?: Date;
    distribution_id?: number;
    route_id?: number;
    customer_id?: number;
  }): Promise<SaleDto[]> {
    const { initDate, finalDate, distribution_id, route_id, customer_id } =
      search;
    const where = {
      OR: [
        { distribution_id },
        { customer_id },
        initDate
          ? {
              distribution: {
                OR: [
                  { route_id },
                  finalDate
                    ? {
                        date: {
                          gte: initDate.toISOString(),
                          lte: finalDate.toISOString(),
                        },
                      }
                    : { date: { equals: initDate.toISOString() } },
                ],
              },
            }
          : {
              distribution: {
                route_id,
              },
            },
      ],
    };

    const sales = await this.prisma.sale.findMany({
      where,
      orderBy: {
        id: 'desc',
      },
    });

    return await Promise.all(sales.map(async (sale) => this.getSaleDto(sale)));
  }

  async create(sale: CreateSaleInput): Promise<SaleDto> {
    const { payment_method, ...info } = sale;
    const customer = await this.prisma.customer.findFirst({
      where: { id: sale.customer_id, delete_at: null },
    });
    if(!customer) throw new CustomerError(CustomerErrorCode.CUSTOMER_NOT_FOUND, `No existe un cliente con id ${sale.customer_id}`);
    const distribution = await this.prisma.distribution.findFirst({
      where: { id: sale.distribution_id, delete_at: null },
    });
    if(!distribution) throw new DistributionError(DistributionErrorCode.DISTRIBUTION_NOT_FOUND, `No existe una distribución con id ${sale.distribution_id}`);
    const user = await this.prisma.user.findFirst({
      where: { id: sale.user_id, delete_at: null },
    });
    if(!user) throw new UserError(UserErrorCode.USER_NOT_FOUND, `No existe un usuario con id ${sale.user_id}`);
    const product = await this.prisma.product_inventory.findFirst({
      where: { id: sale.product_inventory_id, delete_at: null },
    });
    if(!product) throw new ProductError(ProductErrorCode.PRODUCT_NOT_FOUND, `No existe un producto en el inventario con id ${sale.product_inventory_id}`);
    const date = moment().startOf('day').toDate();
    const newSale = await this.prisma.sale.create({ data: { ...info, date } });
    await this.updateTransactionsPayment({
      value: sale.amount * sale.unit_value,
      value_paid: sale.value_paid,
      payment_method: sale.payment_method,
      customer_id: sale.customer_id,
      user_id: sale.user_id,
      sale_id: newSale.id,
    });
    return this.getSaleDto(newSale);
  }

  async update(sale: UpdateSaleInput): Promise<SaleDto> {
    const { id, payment_method, ...info } = sale;
    const value = await this.prisma.sale.findFirst({ where: { id, delete_at: null } });
    if(!value) throw new SaleError(SaleErrorCode.SALE_NOT_FOUND, `No existe una venta con id ${id}`);
    const updateSale = await this.prisma.sale.update({
      where: { id },
      data: { ...info },
    });
    await this.updateTransactionsPayment({
      value: updateSale.amount * updateSale.unit_value,
      value_paid: updateSale.value_paid,
      payment_method: payment_method,
      customer_id: updateSale.customer_id,
      user_id: updateSale.user_id,
      sale_id: updateSale.id,
    });
    return this.getSaleDto(updateSale);
  }

  async delete(id: number): Promise<SaleDto> {
    const sale = await this.prisma.sale.findFirst({ where: { id, delete_at: null } });
    if(!sale) throw new SaleError(SaleErrorCode.SALE_NOT_FOUND, `No existe una venta con id ${id}`);
    const deletedSale = await this.prisma.sale.delete({
      where: { id },
    });
    await this.prisma.transaction_payment.deleteMany({where: {sale_id: id}});
    return this.getSaleDto(deletedSale);
  }

  private async getSaleDto(sale: Sale): Promise<SaleDto> {
    const { update_at, delete_at, ...info } = sale;
    const user_name = (
      await this.prisma.user.findFirstOrThrow({
        where: { id: sale.user_id },
      })
    ).name;
    const transaction = await this.prisma.transaction_payment.findFirst({
        where: { sale_id: sale.id, type: $Enums.transaction_payment_type.SALE },
      });
    const payment_method = transaction?transaction.payment_method: undefined;
    return { ...info, user_name, payment_method };
  }


    async updateTransactionsPayment(values: {value:number, value_paid:number, payment_method?: $Enums.transaction_payment_payment_method, customer_id:number, user_id:number, sale_id: number}) {
        let {value, value_paid, payment_method, customer_id, user_id, sale_id} = values;
        if(!payment_method){
            payment_method = (await this.prisma.transaction_payment.findFirstOrThrow({where:{ sale_id, type: $Enums.transaction_payment_type.PAID}})).payment_method;
        }
        await this.prisma.transaction_payment.deleteMany({where: {sale_id}});
        const date = moment().startOf('day').toDate();
        await this.transactionPaymentService.create({date, value: value_paid, type: $Enums.transaction_payment_type.SALE, payment_method: payment_method, customer_id, user_id, sale_id});
        if(value - value_paid > 0){
            await this.transactionPaymentService.create({date, value: value - value_paid, type: $Enums.transaction_payment_type.DEBT, payment_method: null, customer_id, user_id, sale_id});
        }
    }

  async getSaleReportByDistribution(
    distribution_id: number,
  ): Promise<SaleReport> {
    const report = await this.prisma.transaction_payment.groupBy({
      by: ['payment_method', 'date'],
      _sum: { value: true },
      where: { sale: { distribution_id } },
    });

    const per_method = report.map((item) => {
      return {
        method: item.payment_method,
        value: item._sum.value,
        date: moment(item.date).format('DD/MM/YYYY'),
      };
    });

    const total = per_method.reduce((a, b) => a + (b.method ? b.value : 0), 0);
    const debt = per_method.reduce((a, b) => a + (!b.method ? b.value : 0), 0);

    const quantitySold = (
      await this.prisma.sale.aggregate({
        _sum: { amount: true },
        where: { distribution_id },
      })
    )._sum.amount;

    return { total, per_method, quantitySold, debt };
  }
}

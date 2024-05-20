import { Injectable } from '@nestjs/common';
import { CreateTransactionPayment } from '../dto/transactionPaymentDTO/create-transaction-payment.input';
import { TransactionPaymentDto } from '../dto/transactionPaymentDTO/transaction-payment.output';
import { PrismaService } from 'src/prisma/prisma.service';
import { TransactionPayment } from '../entities/transaction-payment.entity';
import { Pagination } from '../../util/pagination/pagination.output';
import { SearchTransactionInput } from '../dto/search-transaction.input';
import { $Enums } from '@prisma/client';
import { UpdateTransactionPaymentInput } from '../dto/transactionPaymentDTO/update-transaction-payment.input';
import {
  TransactionError,
  TransactionErrorCode,
} from 'src/exceptions/transaction-error';
import { CustomerError, CustomerErrorCode } from 'src/exceptions/customer-error';
import { UserError, UserErrorCode } from 'src/exceptions/user-error';

@Injectable()
export class TransactionPaymentService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    search: SearchTransactionInput,
  ): Promise<Pagination<TransactionPaymentDto>> {
    const { customer_id, pageNumber, size } = search;
    const customer = await this.prisma.customer.findFirst({
      where: { id: customer_id, delete_at: null },
    });
    if(!customer) throw new CustomerError(CustomerErrorCode.CUSTOMER_NOT_FOUND, `No existe un cliente con id ${customer_id}`);
    const transaction_pagination =
      await this.prisma.transaction_payment.findMany({
        where: {
          customer_id,
          OR: [
            { type: $Enums.transaction_payment_type.DEBT },
            { type: $Enums.transaction_payment_type.PAID },
          ],
        },
        take: size,
        skip: (pageNumber - 1) * size,
        orderBy: { id: 'desc' },
      });
    const totalPages = Math.ceil(
      (await this.prisma.transaction_payment.count({
        where: { customer_id },
      })) / size,
    );
    return {
      currentPage: pageNumber,
      items: await Promise.all(
        transaction_pagination.map(async (t) =>
          this.getTransactionPaymentDto(t),
        ),
      ),
      size,
      totalPages,
    };
  }

  async create(
    transaction: CreateTransactionPayment,
  ): Promise<TransactionPaymentDto> {
    const { customer_id, user_id } = transaction;
    const customer = await this.prisma.customer.findFirst({
      where: { id: customer_id, delete_at: null },
    });
    if(!customer) throw new CustomerError(CustomerErrorCode.CUSTOMER_NOT_FOUND, `No existe un cliente con id ${customer_id}`);
    const user = await this.prisma.user.findFirst({
      where: { id: user_id, delete_at: null },
    });
    if(!user) throw new UserError(UserErrorCode.USER_NOT_FOUND, `No existe un usuario con id ${user_id}`);
    if (
      transaction.type === $Enums.transaction_payment_type.PAID &&
      (await this.getTotalDebt(customer_id)) - transaction.value < 0
    ) {
      throw new TransactionError(
        TransactionErrorCode.PAYMENT_EXCEEDS_DEBT,
        `El valor de la transaccion excede la deuda total del cliente con id ${customer_id}`,
      );
    }
    let total = undefined;
    if (transaction.type !== $Enums.transaction_payment_type.SALE) {
      total = await this.calculateTotalPayment(
        customer_id,
        transaction.value,
        transaction.type,
      );
    }
    const newTransaction = await this.prisma.transaction_payment.create({
      data: { ...transaction, total },
    });
    return this.getTransactionPaymentDto(newTransaction);
  }

  async update(
    transaction: UpdateTransactionPaymentInput,
  ): Promise<TransactionPaymentDto> {
    const { id, ...info } = transaction;
    const updateTransaction = await this.prisma.transaction_payment.update({
      where: { id },
      data: { ...info },
    });
    return this.getTransactionPaymentDto(updateTransaction);
  }

  private async getTransactionPaymentDto(
    transaction: TransactionPayment,
  ): Promise<TransactionPaymentDto> {
    const { update_at, delete_at, ...info } = transaction;
    const user_name = (
      await this.prisma.user.findFirstOrThrow({
        where: { id: transaction.user_id },
      })
    ).name;
    return { ...info, user_name };
  }

  async calculateTotalPayment(
    customer_id: number,
    valueAdd: number,
    typeValue: $Enums.transaction_payment_type,
  ): Promise<number> {
    let totalDebt = await this.prisma.transaction_payment.aggregate({
      _sum: {
        value: true,
      },
      where: {
        type: $Enums.transaction_payment_type.DEBT,
        delete_at: null,
        customer_id,
      },
    });
    let totalPaid = await this.prisma.transaction_payment.aggregate({
      _sum: {
        value: true,
      },
      where: {
        type: $Enums.transaction_payment_type.PAID,
        delete_at: null,
        customer_id,
      },
    });
    if (typeValue === $Enums.transaction_payment_type.DEBT) {
      totalDebt._sum.value += valueAdd;
    } else {
      totalPaid._sum.value += valueAdd;
    }
    return totalDebt._sum.value - totalPaid._sum.value;
  }

  async getTotalDebt(customer_id: number): Promise<number> {
    const totalDebt = await this.prisma.transaction_payment.findFirst({
      where: {
        customer_id,
        OR: [
          { type: $Enums.transaction_payment_type.DEBT },
          { type: $Enums.transaction_payment_type.PAID },
        ],
      },
      orderBy: { id: 'desc' },
      take: 1,
    });
    return totalDebt.total;
  }
}

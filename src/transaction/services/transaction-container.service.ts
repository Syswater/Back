import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTransactionContainer } from '../dto/transactionContainerDTO/create-transaction-container.input';
import { TransactionContainerDto } from '../dto/transactionContainerDTO/transaction-container.output';
import { TransactionContainer } from '../entities/transaction-container.entity';
import { SearchTransactionInput } from '../dto/search-transaction.input';
import { Pagination } from 'src/util/pagination/pagination.output';
import { $Enums } from '@prisma/client';
import {
  TransactionError,
  TransactionErrorCode,
} from 'src/exceptions/transaction-error';
import {
  CustomerError,
  CustomerErrorCode,
} from 'src/exceptions/customer-error';
import { UserError, UserErrorCode } from 'src/exceptions/user-error';
import { ProductError, ProductErrorCode } from 'src/exceptions/product-error';

@Injectable()
export class TransactionContainerService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    search: SearchTransactionInput,
  ): Promise<Pagination<TransactionContainerDto>> {
    const { customer_id, pageNumber, size } = search;
    const customer = await this.prisma.customer.findFirst({
      where: { id: customer_id, delete_at: null },
    });
    if (!customer)
      throw new CustomerError(
        CustomerErrorCode.CUSTOMER_NOT_FOUND,
        `No existe un cliente con id ${customer_id}`,
      );
    const transaction_pagination =
      await this.prisma.transaction_container.findMany({
        where: { customer_id },
        take: size,
        skip: (pageNumber - 1) * size,
        orderBy: { id: 'desc' },
      });
    const totalPages = Math.ceil(
      (await this.prisma.transaction_container.count({
        where: { customer_id },
      })) / size,
    );
    return {
      currentPage: pageNumber,
      items: await Promise.all(
        transaction_pagination.map(async (t) =>
          this.getTransactionContainerDto(t),
        ),
      ),
      size,
      totalPages,
    };
  }

  async create(
    transaction: CreateTransactionContainer,
  ): Promise<TransactionContainerDto> {
    const { customer_id, user_id, product_inventory_id } = transaction;
    const customer = await this.prisma.customer.findFirst({
      where: { id: customer_id, delete_at: null },
    });
    if (!customer)
      throw new CustomerError(
        CustomerErrorCode.CUSTOMER_NOT_FOUND,
        `No existe un cliente con id ${customer_id}`,
      );
    const user = await this.prisma.user.findFirst({
      where: { id: user_id, delete_at: null },
    });
    if (!user)
      throw new UserError(
        UserErrorCode.USER_NOT_FOUND,
        `No existe un usuario con id ${user_id}`,
      );
    const product = await this.prisma.product_inventory.findFirst({
      where: { id: product_inventory_id, delete_at: null },
    });
    if (!product)
      throw new ProductError(
        ProductErrorCode.PRODUCT_NOT_FOUND,
        `No existe un producto en el inventario con id ${product_inventory_id}`,
      );
    if (
      transaction.type === $Enums.transaction_container_type.RETURNED &&
      (await this.getTotalBorrowed(customer_id)) - transaction.value < 0
    ) {
      throw new TransactionError(
        TransactionErrorCode.CONTAINERS_EXCEED_BORROWED,
        `El valor de la transaccion excede del total de contenedores prestados para el cliente con id ${customer_id}`,
      );
    }
    const total = await this.calculateTotalContainer(
      customer_id,
      transaction.value,
      transaction.type,
    );
    const newTransaction = await this.prisma.transaction_container.create({
      data: { ...transaction, total },
    });
    return this.getTransactionContainerDto(newTransaction);
  }

  private async getTransactionContainerDto(
    transaction: TransactionContainer,
  ): Promise<TransactionContainerDto> {
    const { update_at, delete_at, ...info } = transaction;
    const user_name = (
      await this.prisma.user.findFirstOrThrow({
        where: { id: transaction.user_id },
      })
    ).name;
    return { ...info, user_name };
  }

  async calculateTotalContainer(
    customer_id: number,
    valueAdd: number,
    typeValue: $Enums.transaction_container_type,
  ): Promise<number> {
    let totalBorrowed = await this.prisma.transaction_container.aggregate({
      _sum: {
        value: true,
      },
      where: {
        type: $Enums.transaction_container_type.BORROWED,
        customer_id,
      },
    });
    let totalReturned = await this.prisma.transaction_container.aggregate({
      _sum: {
        value: true,
      },
      where: {
        type: $Enums.transaction_container_type.RETURNED,
        customer_id,
      },
    });
    if (typeValue === $Enums.transaction_container_type.BORROWED) {
      totalBorrowed._sum.value += valueAdd;
    } else {
      totalReturned._sum.value += valueAdd;
    }
    return totalBorrowed._sum.value - totalReturned._sum.value;
  }

  async getTotalBorrowed(customer_id: number): Promise<number> {
    const totalBorrowed = await this.prisma.transaction_container.findFirst({
      where: { customer_id },
      orderBy: { id: 'desc' },
      take: 1,
    });
    return totalBorrowed.total;
  }
}

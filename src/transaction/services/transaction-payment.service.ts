import { Injectable } from '@nestjs/common';
import { CreateTransactionPayment } from '../dto/transactionPaymentDTO/create-transaction-payment.input';
import { TransactionPaymentDto } from '../dto/transactionPaymentDTO/transaction-payment.output';
import { PrismaService } from 'src/prisma/prisma.service';
import { TransactionPayment } from '../entities/transaction-payment.entity';
import { PaginationInput } from '../../util/pagination/pagination.input';
import { Pagination } from '../../util/pagination/pagination.output';
import { SearchTransactionInput } from '../dto/search-transaction.input';

@Injectable()
export class TransactionPaymentService {

    constructor(private readonly prisma:PrismaService){}

    async findAll(search: SearchTransactionInput): Promise<Pagination<TransactionPaymentDto>>{
        const { customer_id, pageNumber, size } = search;
        await this.prisma.customer.findFirstOrThrow({where: {id: customer_id, delete_at: null}});
        const transaction_pagination = await this.prisma.transaction_payment.findMany({where:{customer_id}, take: size, skip: ((pageNumber-1) * size)});
        const totalPages = Math.ceil(await this.prisma.transaction_payment.count({where:{customer_id}}) / size);
        return {
            currentPage: pageNumber,
            items: transaction_pagination.map(t => this.getTransactionPaymentDto(t)),
            size,
            totalPages
        }
    }

    async create(transaction: CreateTransactionPayment): Promise<TransactionPaymentDto>{
        const {customer_id, user_id} = transaction;
        await this.prisma.customer.findFirstOrThrow({where:{id: customer_id, delete_at: null}});
        await this.prisma.user.findFirstOrThrow({where:{id: user_id, delete_at: null}});
        const newTransaction = await this.prisma.transaction_payment.create({data: transaction });
        return this.getTransactionPaymentDto(newTransaction);
    }

    private getTransactionPaymentDto(transaction:TransactionPayment): TransactionPaymentDto {
        const { update_at, delete_at, ...info } = transaction;
        return { ...info };
    }

}

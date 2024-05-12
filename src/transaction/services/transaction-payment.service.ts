import { Injectable } from '@nestjs/common';
import { CreateTransactionPayment } from '../dto/transactionPaymentDTO/create-transaction-payment.input';
import { TransactionPaymentDto } from '../dto/transactionPaymentDTO/transaction-payment.output';
import { PrismaService } from 'src/prisma/prisma.service';
import { TransactionPayment } from '../entities/transaction-payment.entity';
import { Pagination } from '../../util/pagination/pagination.output';
import { SearchTransactionInput } from '../dto/search-transaction.input';
import { $Enums } from '@prisma/client';
import { UpdateTransactionPaymentInput } from '../dto/transactionPaymentDTO/update-transaction-payment.input';

@Injectable()
export class TransactionPaymentService {

    constructor(private readonly prisma: PrismaService) { }

    async findAll(search: SearchTransactionInput): Promise<Pagination<TransactionPaymentDto>>{
        const { customer_id, pageNumber, size } = search;
        await this.prisma.customer.findFirstOrThrow({where: {id: customer_id, delete_at: null}});
        const transaction_pagination = await this.prisma.transaction_payment.findMany({where:{customer_id, OR: [{type: $Enums.transaction_payment_type.DEBT}, {type: $Enums.transaction_payment_type.PAID}]}, take: size, skip: ((pageNumber-1) * size), orderBy: {id: 'desc'}});
        const totalPages = Math.ceil(await this.prisma.transaction_payment.count({where:{customer_id}}) / size);
        return {
            currentPage: pageNumber,
            items: transaction_pagination.map(t => this.getTransactionPaymentDto(t)),
            size,
            totalPages
        }
    }

    async create(transaction: CreateTransactionPayment): Promise<TransactionPaymentDto> {
        const { customer_id, user_id } = transaction;
        await this.prisma.customer.findFirstOrThrow({ where: { id: customer_id, delete_at: null } });
        await this.prisma.user.findFirstOrThrow({ where: { id: user_id, delete_at: null } });
        let total = undefined;
        if(transaction.type !== $Enums.transaction_payment_type.SALE){
            total = await this.calculateTotalPayment(customer_id, transaction.value, transaction.type);
        }
        const newTransaction = await this.prisma.transaction_payment.create({ data: {...transaction, total}, });
        return this.getTransactionPaymentDto(newTransaction);
    }

    async update(transaction: UpdateTransactionPaymentInput): Promise<TransactionPaymentDto> {
        const { id, ...info } = transaction;
        const updateTransaction = await this.prisma.transaction_payment.update({
            where: {id},
            data: {...info}
        })
        return this.getTransactionPaymentDto(updateTransaction);
    }

    private getTransactionPaymentDto(transaction:TransactionPayment): TransactionPaymentDto {
        const { update_at, delete_at, ...info } = transaction;
        return { ...info };
    }

    async calculateTotalPayment(customer_id: number, valueAdd: number, typeValue: $Enums.transaction_payment_type): Promise<number> {
        let totalDebt = await this.prisma.transaction_payment.aggregate({
            _sum: {
                value: true
            },
            where: {
                type: $Enums.transaction_payment_type.DEBT,
                delete_at: null,
                customer_id
            }
        });
        let totalPaid = await this.prisma.transaction_payment.aggregate({
            _sum: {
                value: true
            },
            where: {
                type: $Enums.transaction_payment_type.PAID,
                delete_at: null,
                customer_id
            }
        });
        if(typeValue === $Enums.transaction_payment_type.DEBT){
            totalDebt._sum.value += valueAdd;
        }else{
            totalPaid._sum.value += valueAdd;
        }
        return totalDebt._sum.value - totalPaid._sum.value;
    }

}

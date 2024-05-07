import { Injectable } from '@nestjs/common';
import { CreateTransactionPayment } from '../dto/transactionPaymentDTO/create-transaction-payment.input';
import { TransactionPaymentDto } from '../dto/transactionPaymentDTO/transaction-payment.output';
import { PrismaService } from 'src/prisma/prisma.service';
import { TransactionPayment } from '../entities/transaction-payment.entity';

@Injectable()
export class TransactionPaymentService {

    constructor(private readonly prisma: PrismaService) { }

    async create(transaction: CreateTransactionPayment): Promise<TransactionPaymentDto> {
        const { sale_id, user_id } = transaction;
        await this.prisma.sale.findFirstOrThrow({ where: { id: sale_id, delete_at: null } });
        await this.prisma.user.findFirstOrThrow({ where: { id: user_id, delete_at: null } });
        const newTransaction = await this.prisma.transaction_payment.create({ data: transaction });
        return this.getTransactionPaymentDto(newTransaction);
    }


    private getTransactionPaymentDto(transaction: TransactionPayment): TransactionPaymentDto {
        const { update_at, delete_at, ...info } = transaction;
        return { ...info };
    }

}

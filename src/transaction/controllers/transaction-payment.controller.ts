import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { TransactionPaymentDto } from '../dto/transactionPaymentDTO/transaction-payment.output';
import { TransactionPaymentService } from '../services/transaction-payment.service';
import { CreateTransactionPayment } from '../dto/transactionPaymentDTO/create-transaction-payment.input';

@Controller('transactionPayment')
export class TransactionPaymentController {

    constructor(private readonly transactionService:TransactionPaymentService){}

    @Post('create')
    async create(@Body() transaction: CreateTransactionPayment ):Promise<TransactionPaymentDto>{
        try {
            const newTransaction = this.transactionService.create(transaction);
            return newTransaction;
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

}

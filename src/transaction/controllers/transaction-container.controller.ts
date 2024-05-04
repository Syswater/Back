import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { TransactionContainerService } from '../services/transaction-container.service';
import { CreateTransactionContainer } from '../dto/transactionContainerDTO/create-transaction-container.input';
import { TransactionContainerDto } from '../dto/transactionContainerDTO/transaction-container.output';

@Controller('transactionContainer')
export class TransactionContainerController {

    constructor(private readonly transactionService:TransactionContainerService){}

    @Post('create')
    async create(@Body() transaction: CreateTransactionContainer ):Promise<TransactionContainerDto>{
        try {
            const newTransaction = this.transactionService.create(transaction);
            return newTransaction;
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

}

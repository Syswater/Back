import { BadRequestException, Body, Controller, Get, Param, Post } from '@nestjs/common';
import { TransactionPaymentDto } from '../dto/transactionPaymentDTO/transaction-payment.output';
import { TransactionPaymentService } from '../services/transaction-payment.service';
import { CreateTransactionPayment } from '../dto/transactionPaymentDTO/create-transaction-payment.input';
import { TransactionError, TransactionErrorCode } from 'src/exceptions/transaction-error';

@Controller('transactionPayment')
export class TransactionPaymentController {

    constructor(private readonly transactionService:TransactionPaymentService){}

    @Get('findAll/:pageNumber/:size/:customer_id')
    async findAll(
                @Param('pageNumber') pageNumber:string,
                @Param('size') size: string,
                @Param('customer_id') customer_id: string){
        try {
            const pageNumberInt = parseInt(pageNumber);
            const sizeInt = parseInt(size);
            const customerIdInt = parseInt(customer_id);
            if(isNaN(pageNumberInt) || isNaN(sizeInt) || isNaN(customerIdInt) )
                throw new TransactionError(TransactionErrorCode.PARAMETERS_ARE_NUMBERS, "Los parametros pageNumber, size y customer_id deben ser numeros");
            if( pageNumberInt <= 0 || sizeInt <= 0 || customerIdInt <= 0) 
                throw new TransactionError(TransactionErrorCode.PARAMETERS_POSITIVE_VALUES, "Los parametros pageNumber, size y customer_id deben ser valores mayores que 0");
            const paginationTransaction = await this.transactionService.findAll({pageNumber: parseInt(pageNumber), customer_id: parseInt(customer_id), size: parseInt(size)});
            return paginationTransaction;
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

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

import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTransactionContainer } from '../dto/transactionContainerDTO/create-transaction-container.input';
import { TransactionContainerDto } from '../dto/transactionContainerDTO/transaction-container.output';
import { TransactionContainer } from '../entities/transaction-container.entity';

@Injectable()
export class TransactionContainerService {

    constructor(private readonly prisma:PrismaService){}

    async create(transaction: CreateTransactionContainer): Promise<TransactionContainerDto>{
        const {customer_id, user_id, product_inventroy_id} = transaction;
        await this.prisma.customer.findFirstOrThrow({where:{id: customer_id, delete_at: null}});
        await this.prisma.user.findFirstOrThrow({where:{id: user_id, delete_at: null}});
        await this.prisma.product_inventory.findFirstOrThrow({where:{id: product_inventroy_id, delete_at: null} });
        const newTransaction = await this.prisma.transaction_container.create({data: transaction });
        return this.getTransactionContainerDto(newTransaction);
    }


    private getTransactionContainerDto(transaction:TransactionContainer): TransactionContainerDto {
        const { update_at, delete_at, ...info } = transaction;
        return { ...info };
    }

}

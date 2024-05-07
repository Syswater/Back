import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTransactionContainer } from '../dto/transactionContainerDTO/create-transaction-container.input';
import { TransactionContainerDto } from '../dto/transactionContainerDTO/transaction-container.output';
import { TransactionContainer } from '../entities/transaction-container.entity';
import { SearchTransactionInput } from '../dto/search-transaction.input';
import { Pagination } from 'src/util/pagination/pagination.output';

@Injectable()
export class TransactionContainerService {

    constructor(private readonly prisma:PrismaService){}

    async findAll(search: SearchTransactionInput): Promise<Pagination<TransactionContainerDto>>{
        const { customer_id, pageNumber, size } = search;
        await this.prisma.customer.findFirstOrThrow({where: {id: customer_id, delete_at: null}});
        const transaction_pagination = await this.prisma.transaction_container.findMany({where:{customer_id}, take: size, skip: ((pageNumber-1) * size)});
        const totalPages = Math.ceil(await this.prisma.transaction_container.count({where:{customer_id}}) / size);
        return {
            currentPage: pageNumber,
            items: transaction_pagination.map(t => this.getTransactionContainerDto(t)),
            size,
            totalPages
        }
    }

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

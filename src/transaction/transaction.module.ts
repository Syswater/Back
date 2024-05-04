import { Module } from '@nestjs/common';
import { TransactionPaymentService } from './services/transaction-payment.service';
import { TransactionPaymentController } from './controllers/transaction-payment.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { TransactionContainerService } from './services/transaction-container.service';
import { TransactionContainerController } from './controllers/transaction-container.controller';
import { TransactionContainerTriggersService } from './triggers/transaction-container-triggers.service';
import { TransactionPaymentTriggersService } from './triggers/transaction-payment-triggers.service';

@Module({
  providers: [PrismaService ,TransactionPaymentService, TransactionContainerService, TransactionContainerTriggersService, TransactionPaymentTriggersService],
  controllers: [TransactionPaymentController, TransactionContainerController]
})
export class TransactionModule {}

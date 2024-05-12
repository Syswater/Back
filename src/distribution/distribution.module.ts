import { Module } from '@nestjs/common';
import { DistributionService } from './services/distribution.service';
import { DistributionController } from './controllers/distribution.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { ExpenseCategoryService } from './services/expense-category.service';
import { ExpenseService } from './services/expense.service';
import { ProductInventoryService } from './services/product-inventory.service';
import { SaleService } from './services/sale.service';
import { DistributionTriggersService } from './triggers/distribution-triggers.service';
import { ExpenseTriggersService } from './triggers/expense-triggers.service';
import { ProductTriggersService } from './triggers/product-triggers.service';
import { SaleTriggersService } from './triggers/sale-triggers.service';
import { ExpenseCategoryController } from './controllers/expense-category.controller';
import { ExpenseController } from './controllers/expense.controller';
import { ProductInventoryController } from './controllers/product-inventory.controller';
import { SaleController } from './controllers/sale.controller';
import { TransactionPaymentService } from 'src/transaction/services/transaction-payment.service';

@Module({
  providers: [
    DistributionService, 
    PrismaService, 
    ExpenseCategoryService, 
    ExpenseService,
    ProductInventoryService,
    SaleService,
    DistributionTriggersService,
    ExpenseTriggersService,
    ProductTriggersService,
    SaleTriggersService,
    TransactionPaymentService
  ],
  controllers: [
    DistributionController,
    ExpenseCategoryController,
    ExpenseController,
    ProductInventoryController,
    SaleController
  ]
})
export class DistributionModule {}

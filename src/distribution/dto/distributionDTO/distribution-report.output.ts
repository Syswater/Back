import { ExpenseReport } from '../expenseDTO/expense-report.output';
import { ContainerReport } from '../productDTO/product-inventory-report.output';
import { SaleReport } from '../saleDTO/sale-report.output';

export class DistributionReport {
  saleReport: SaleReport;
  expenseReport: ExpenseReport;
  balance: number;
  containerReport: ContainerReport[];
  load: number;
}

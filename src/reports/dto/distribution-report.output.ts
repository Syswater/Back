import { ExpenseReport } from './expense-report.output';
import { ContainerReport } from './product-inventory-report.output';
import { SaleReport } from './sale-report.output';

export class DistributionReport {
  saleReport: SaleReport;
  expenseReport: ExpenseReport;
  balance: number;
  containerReport: ContainerReport[];
  load: number;
}

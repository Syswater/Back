import { expense_category } from '@prisma/client';

export class ExpenseReport {
  total: number;
  per_category: { category: expense_category; value: number }[];
}

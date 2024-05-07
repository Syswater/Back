export class ExpenseDto{
    id: number;
    value: number;
    date: Date;
    description: string;
    distribution_id: number;
    expense_category_id: number;
    expense_category?: string;
}
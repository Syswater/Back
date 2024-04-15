import { expense } from "@prisma/client";

export class Expense implements expense{
    id: number;
    value: number;
    date: Date;
    description: string;
    update_at: Date;
    delete_at: Date;
    distribution_id: number;
    expense_category_id: number;
}
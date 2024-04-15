import { expense_category } from "@prisma/client";

export class ExpenseCategory implements expense_category{
    id: number;
    type: string;
}
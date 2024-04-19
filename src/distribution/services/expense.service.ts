import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { ExpenseDto } from "../dto/expenseDTO/expense.output";
import { Expense } from "../entities/expense.entity";
import { CreateExpenseInput } from "../dto/expenseDTO/create-expense.input";
import { UpdateExpenseInput } from "../dto/expenseDTO/update-expense.input";

@Injectable()
export class ExpenseService{
    constructor(private readonly prisma: PrismaService) { }

    async getExpenses(search: {initDate?:Date, finalDate?:Date, distribution_id?:number, expense_category_id}): Promise<ExpenseDto[]> {
        const { initDate, finalDate, distribution_id, expense_category_id } = search;
        const where = {
            OR: [
                {distribution_id},
                {expense_category_id},
                initDate? finalDate? 
                    { date: { gte: initDate.toISOString(), lte: finalDate.toISOString() } }
                    : { date: { equals: initDate.toISOString()} }
                    : {},
            ]
        };
    
        const expenses = await this.prisma.expense.findMany({
            where,
        });
    
        return expenses.map(expense => this.getExpenseDto(expense));
    }

    async create(expense: CreateExpenseInput): Promise<ExpenseDto> {
        await this.prisma.distribution.findFirstOrThrow({where:{id:expense.distribution_id, delete_at: null}});
        await this.prisma.expense_category.findFirstOrThrow({where:{id:expense.expense_category_id}});
        const newExpense = await this.prisma.expense.create({ data: expense });
        return this.getExpenseDto(newExpense);
    }

    async update(expense: UpdateExpenseInput): Promise<ExpenseDto> {
        const {id, ...info} = expense;
        const updateExpense = await this.prisma.expense.update({
            where: { id },
            data: { ...info }
        })
        return this.getExpenseDto(updateExpense)
    }

    async delete(id: number): Promise<ExpenseDto> {
        const expense = await this.prisma.expense.findFirstOrThrow({ where: { id, delete_at: null } });
        const deletedExpense = await this.prisma.expense.delete({
            where: { id }
        });
        return this.getExpenseDto(deletedExpense);
    }

    private getExpenseDto(expense:Expense): ExpenseDto {
        const { update_at, delete_at, ...info } = expense;
        return { ...info };
    }
}
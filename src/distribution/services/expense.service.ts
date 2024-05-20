import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { ExpenseDto } from "../dto/expenseDTO/expense.output";
import { Expense } from "../entities/expense.entity";
import { CreateExpenseInput } from "../dto/expenseDTO/create-expense.input";
import { UpdateExpenseInput } from "../dto/expenseDTO/update-expense.input";
import { ExpenseCategory } from "../entities/expense-category.entity";
import { DistributionError, DistributionErrorCode } from "src/exceptions/distribution-error";
import { ExpenseError, ExpenseErrorCode } from "src/exceptions/expense-error";

@Injectable()
export class ExpenseService{
    constructor(private readonly prisma: PrismaService) { }

    async getExpenses(search: {initDate?:Date, finalDate?:Date, distribution_id?:number, expense_category_id}): Promise<ExpenseDto[]> {
        const { initDate, finalDate, distribution_id, expense_category_id } = search;
        const where = {
            AND: [
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
            select:{
                id: true,
                value: true,
                date: true,
                description:true,
                distribution_id: true,
                expense_category_id:true,
                update_at: true,
                delete_at: true,
                expense_category: true
            }
        });
    
        return expenses.map(expense => {
            const { expense_category, ...info } = expense;
            return this.getExpenseDto( {...info}, expense_category);
        });
    }

    async create(expense: CreateExpenseInput): Promise<ExpenseDto> {
        const distribution = await this.prisma.distribution.findFirst({where:{id:expense.distribution_id, delete_at: null}});
        if(!distribution) throw new DistributionError(DistributionErrorCode.DISTRIBUTION_NOT_FOUND, `No existe una distribución con id ${expense.distribution_id}`)
        const expense_category = await this.prisma.expense_category.findFirst({where:{id:expense.expense_category_id}});
        if(!expense_category) throw new ExpenseError(ExpenseErrorCode.CATEGORY_NOT_FOUND, `No existe una categoria de gasto con id ${expense.expense_category_id}`)
        const newExpense = await this.prisma.expense.create({ data: expense });
        return this.getExpenseDto(newExpense);
    }

    async update(expense: UpdateExpenseInput): Promise<ExpenseDto> {
        const {id, ...info} = expense;
        const value = await this.prisma.expense.findFirst({where: {id, delete_at: null}});
        if(!value) throw new ExpenseError(ExpenseErrorCode.EXPENSE_NOT_FOUND, `No existe un gasto con id ${id}`)
        const updateExpense = await this.prisma.expense.update({
            where: { id },
            data: { ...info }
        })
        return this.getExpenseDto(updateExpense)
    }

    async delete(id: number): Promise<ExpenseDto> {
        const expense = await this.prisma.expense.findFirst({ where: { id, delete_at: null } });
        if(!expense) throw new ExpenseError(ExpenseErrorCode.EXPENSE_NOT_FOUND, `No existe un gasto con id ${id}`)
        const deletedExpense = await this.prisma.expense.delete({
            where: { id }
        });
        return this.getExpenseDto(deletedExpense);
    }

    private getExpenseDto(expense:Expense, expense_category?:ExpenseCategory): ExpenseDto {
        const { update_at, delete_at, ...info } = expense;
        return { ...info, expense_category:expense_category? expense_category.type :undefined };
    }
}
import { BadRequestException, Body, Controller, Delete, Get, Post, Put, Query } from "@nestjs/common";
import { ExpenseService } from "../services/expense.service";
import { ExpenseDto } from "../dto/expenseDTO/expense.output";
import { CreateExpenseInput } from "../dto/expenseDTO/create-expense.input";
import { UpdateExpenseInput } from "../dto/expenseDTO/update-expense.input";
import { DeleteExpenseInput } from "../dto/expenseDTO/delete-expense.input";

@Controller('expense')
export class ExpenseController{

    constructor(private readonly expenseService:ExpenseService){}

    @Get('findAll')
    async findAll(
        @Query('distribution_id') distribution_id?:string,
        @Query('expense_category_id') expense_category_id?:string,
        @Query('initDate') initDate?:string,
        @Query('finalDate') finalDate?:string,
    ):Promise<ExpenseDto[]>{
        try {
            return this.expenseService.getExpenses(
                {
                    distribution_id: distribution_id? parseInt(distribution_id):undefined,
                    expense_category_id: expense_category_id? parseInt(expense_category_id):undefined,
                    initDate: initDate? new Date(initDate): undefined, // yyyy-mm-dd
                    finalDate: finalDate? new Date(finalDate): undefined
                }
            )
        } catch (error) {
            throw new BadRequestException("Los datos proporcionados son incorrectos");
        }
    }


    @Post('create')
    async create(@Body() expense: CreateExpenseInput): Promise<ExpenseDto> {
        try {
            const newExpense = await this.expenseService.create(expense);
            return newExpense;
        } catch (error) {
            throw new BadRequestException("Los datos proporcionados son incorrectos");
        }
    }

    @Put('update')
    async update(@Body() expense: UpdateExpenseInput): Promise<ExpenseDto> {
        try {
            const updatedExpense = await this.expenseService.update(expense);
            return updatedExpense;
        } catch (error) {
            throw new BadRequestException("Los datos proporcionados son incorrectos");
        }
    }

    @Delete('delete')
    async delete(@Body() params: DeleteExpenseInput): Promise<ExpenseDto> {
        return await this.expenseService.delete(params.id);
    }

}
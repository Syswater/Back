import { BadRequestException, Body, Controller, Delete, Get, Post, Put } from "@nestjs/common";
import { ExpenseCategoryService } from "../services/expense-category.service";
import { ExpenseCategoryDto } from "../dto/expenseCategoryDTO/expenseCategory.output";
import { CreateExpenseCategoryInput } from "../dto/expenseCategoryDTO/create-expenseCategory.input";
import { UpdateExpenseCategoryInput } from "../dto/expenseCategoryDTO/update-expenseCategory";
import { DeleteExpenseCategoryInput } from "../dto/expenseCategoryDTO/delete-expenseCategory";

@Controller('expense_category')
export class ExpenseCategoryController{
    constructor(private readonly expenseCategoryService:ExpenseCategoryService){}

    @Get('findAll')
    async findAll():Promise<ExpenseCategoryDto[]>{
        try {
            return this.expenseCategoryService.getExpenseCategories();
        } catch (error) {
            throw new BadRequestException("Los datos proporcionados son incorrectos");
        }
    }


    @Post('create')
    async create(@Body() expenseCategory: CreateExpenseCategoryInput): Promise<ExpenseCategoryDto> {
        try {
            const newCategory= await this.expenseCategoryService.create(expenseCategory);
            return newCategory;
        } catch (error) {
            throw new BadRequestException("Los datos proporcionados son incorrectos");
        }
    }

    @Put('update')
    async update(@Body() expenseCategory: UpdateExpenseCategoryInput): Promise<ExpenseCategoryDto> {
        try {
            const updatedCategory = await this.expenseCategoryService.update(expenseCategory);
            return updatedCategory;
        } catch (error) {
            throw new BadRequestException("Los datos proporcionados son incorrectos");
        }
    }

    @Delete('delete')
    async delete(@Body() params: DeleteExpenseCategoryInput): Promise<ExpenseCategoryDto> {
        return await this.expenseCategoryService.delete(params.id);
    }
}
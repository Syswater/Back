import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { ExpenseCategoryDto } from "../dto/expenseCategoryDTO/expenseCategory.output";
import { ExpenseCategory } from "../entities/expense-category.entity";
import { CreateExpenseCategoryInput } from "../dto/expenseCategoryDTO/create-expenseCategory.input";
import { UpdateExpenseCategoryInput } from "../dto/expenseCategoryDTO/update-expenseCategory";

@Injectable()
export class ExpenseCategoryService {
    constructor(private readonly prisma: PrismaService) { }

    async getExpenseCategories(): Promise<ExpenseCategoryDto[]> {
        const categories = await this.prisma.expense_category.findMany({ where: {}, orderBy: { type: "asc" } });
        return categories.map(categorie => this.getExpenseCategoryDto(categorie));
    }

    async create(expenseCategory: CreateExpenseCategoryInput): Promise<ExpenseCategoryDto> {
        const { ...info } = expenseCategory;
        const newCategory = await this.prisma.expense_category.create({ data: { ...info } });
        return this.getExpenseCategoryDto(newCategory);
    }

    async update(expenseCategory: UpdateExpenseCategoryInput): Promise<ExpenseCategoryDto> {
        const { id, ...info } = expenseCategory;
        const updateCategory = await this.prisma.expense_category.update({
            where: { id },
            data: { ...info }
        })
        return this.getExpenseCategoryDto(updateCategory)
    }

    async delete(id: number): Promise<ExpenseCategoryDto> {
        const category = await this.prisma.expense_category.findFirstOrThrow({ where: { id } });
        const deletedCategory = await this.prisma.expense_category.delete({
            where: { id }
        });
        return this.getExpenseCategoryDto(deletedCategory);
    }

    private getExpenseCategoryDto(product: ExpenseCategory): ExpenseCategoryDto {
        const { ...info } = product;
        return { ...info };
    }
}
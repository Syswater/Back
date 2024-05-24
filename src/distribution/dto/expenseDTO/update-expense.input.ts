import { Equals, IsBoolean, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString } from "class-validator";

export class UpdateExpenseInput{

    @IsNotEmpty({message:'El id no puede estar vacio'})
    @IsInt({message:'El id debe ser un numero entero'})
    @IsPositive({message: 'El id debe ser positivo'})
    id: number;

    @IsOptional()
    @IsInt({message:'El valor debe ser un numero entero'})
    @IsPositive({message: 'El valor debe ser positivo'})
    value?: number;

    @IsOptional()
    @IsInt({ message: 'El id de la categoria debe ser un numero entero' })
    @IsPositive({ message: 'El id de la categoria debe ser positivo' })
    expense_category_id?: number;

    @IsOptional()
    @IsString({message:'La descripcion debe ser un string'})
    description?: string;

    @IsBoolean()
    @Equals(true, { message: 'Se debe proporcionar un id' })
    get isValid(): boolean {
        return !!this.id;
    }

}
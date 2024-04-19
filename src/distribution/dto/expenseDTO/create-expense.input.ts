import { IsDateString, IsInt, IsNotEmpty, IsPositive, IsString } from "class-validator";

export class CreateExpenseInput{

    @IsNotEmpty({message:'El valor no puede estar vacio'})
    @IsInt({message:'El valor debe ser un numero entero'})
    @IsPositive({message: 'El valor debe ser positivo'})
    value: number;

    @IsNotEmpty({message:'La fecha no puede estar vacia'})
    @IsDateString()
    date: Date;

    @IsNotEmpty({message:'La descripcion no puede estar vacia'})
    @IsString({message:'La descripcion debe ser un string'})
    description: string;

    @IsNotEmpty({message:'El id de distribucion no puede estar vacio'})
    @IsInt({message:'El id de distribucion debe ser un numero entero'})
    @IsPositive({message: 'El id de distribucion debe ser positivo'})
    distribution_id: number;

    @IsNotEmpty({message:'El id de categoria no puede estar vacio'})
    @IsInt({message:'El id de categoria debe ser un numero entero'})
    @IsPositive({message: 'El id de categoria debe ser positivo'})
    expense_category_id: number;
}
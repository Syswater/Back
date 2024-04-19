import { IsNotEmpty, IsInt, IsPositive } from "class-validator";

export class DeleteExpenseInput{
    @IsNotEmpty({message:'El id no puede estar vacio'})
    @IsInt({message:'El id debe ser un numero entero'})
    @IsPositive({message: 'El id debe ser positivo'})
    id: number;
}
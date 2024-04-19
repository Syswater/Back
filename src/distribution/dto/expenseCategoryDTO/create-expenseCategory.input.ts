import { IsNotEmpty, IsString } from "class-validator";

export class CreateExpenseCategoryInput{
    
    @IsNotEmpty({message: 'El tipo de gasto no puede estar vacio'})
    @IsString({message: 'El tipo de gasto debe ser un string'})
    type:string;
    
}
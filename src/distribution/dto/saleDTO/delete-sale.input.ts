import { IsNotEmpty, IsInt, IsPositive } from "class-validator";

export class DeleteSaleInput{
    @IsNotEmpty({message: 'El id no puede estar vacio'})
    @IsInt({message: 'El id debe ser un numero entero'})
    @IsPositive({message: 'El id debe ser un valor positivo'})
    id: number;
}
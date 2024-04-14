import { IsNotEmpty, IsInt, IsPositive } from "class-validator";

export class DeleteOrderInput{
    @IsNotEmpty({message: 'El id no puede estar vacio'})
    @IsInt({message: 'El debe ser un numero entero'})
    @IsPositive({message: 'El debe ser un entero positivo'})
    id: number;
}
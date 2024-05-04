import { IsInt, IsNotEmpty, IsPositive } from "class-validator";

export class DeleteUserInput {

    @IsNotEmpty({ message: 'El id no puede estar vacio' })
    @IsInt({ message: 'El id debe ser un entero' })
    @IsPositive({ message: 'El id debe ser un valor positivo' })
    id: number;
}
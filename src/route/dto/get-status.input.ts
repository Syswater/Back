import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';

export class GetStatusInput {
    @IsInt({ message: 'El id debe ser un número entero.' })
    @IsNotEmpty({ message: 'El id no puede estar vacío.' })
    @IsPositive({ message: 'El id debe ser un número positivo.' })
    id: number;
}

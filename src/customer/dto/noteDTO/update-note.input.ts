import { IsNotEmpty, IsString, IsInt, IsPositive, IsOptional } from "class-validator";

export class UpdateNoteInput{
    
    @IsPositive({ message: "El id debe ser un numero positivo" })
    @IsInt({ message: "El id debe ser un numero entero" })
    @IsNotEmpty({ message: "El id no puede estar vacio" })
    id: number

    @IsOptional()
    @IsString()
    description?: string;

    @IsInt({message: 'El id de distribución debe ser un entero'})
    @IsPositive({message: 'El id de distribución debe ser un entero positivo'})
    @IsOptional()
    distribution_id?: number;

    @IsInt({message: 'El id de cliente debe ser un entero'})
    @IsPositive({message: 'El id de cliente debe ser un entero positivo'})
    @IsOptional()
    customer_id?: number; 
}
import { IsInt, IsNotEmpty, IsOptional, IsPositive, IsString } from "class-validator";

export class CreateNoteInput{

    @IsNotEmpty({message: 'La descripción no puede estar vacia'})
    @IsString()
    description: string;

    @IsInt({message: 'El id de distribución debe ser un entero'})
    @IsPositive({message: 'El id de distribución debe ser un entero positivo'})
    @IsOptional()
    distribution_id?: number;

    @IsInt({message: 'El id de cliente debe ser un entero'})
    @IsPositive({message: 'El id de cliente debe ser un entero positivo'})
    @IsNotEmpty({message: 'El id de cliente no puede estar vacio'})
    customer_id: number; 
    
}
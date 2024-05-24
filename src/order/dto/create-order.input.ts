import { IsDateString, IsInt, IsNotEmpty, IsPositive, IsString, Min } from "class-validator";

export class CreateOrderInput{
    @IsNotEmpty({message: 'La cantidad no puede estar vacia'})
    @IsInt({message: 'La cantidad debe ser un numero entero'})
    @Min(0, {message: 'La cantidad debe ser un entero positivo'})
    amount: number;

    @IsDateString({}) // Formato "2024-04-14T12:00:00Z" formato de fecha ISO-8601
    @IsNotEmpty({message: 'La fecha no puede estar vacia'})
    date: Date;

    @IsNotEmpty({message: 'El tipo de tapa no puede estar vacio'})
    @IsString({message: 'El tipo de tapa debe ser un string'})
    tape_type: string;

    @IsNotEmpty({message: 'La id del cliente no puede estar vacio'})
    @IsInt({message: 'La id del cliente debe ser un numero entero'})
    @IsPositive({message: 'La id del cliente debe ser un entero positivo'})
    customer_id: number;

    @IsNotEmpty({message: 'La id de la deistribucion no puede estar vacio'})
    @IsInt({message: 'La id de la deistribucion debe ser un numero entero'})
    @IsPositive({message: 'La id de la deistribucion debe ser un entero positivo'})
    distribution_id: number;
}
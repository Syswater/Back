import { $Enums } from "@prisma/client";
import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsPositive, Min } from "class-validator";

export class InitDistributionInput{

    @IsNotEmpty({message: 'La fecha no puede estar vacia'})
    @IsDateString()
    date: Date;
    
    @IsNotEmpty({message:'El id de la ruta no puede estar vacio'})
    @IsInt({message:'El id de la ruta debe ser un numero entero'})
    @IsPositive({message: 'El id de la ruta debe ser positivo'})
    route_id: number;

}
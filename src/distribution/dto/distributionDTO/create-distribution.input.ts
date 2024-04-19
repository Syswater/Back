import { $Enums } from "@prisma/client";
import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsPositive } from "class-validator";

export class CreateDistributionInput{

    @IsNotEmpty({message: 'La fecha no puede estar vacia'})
    @IsDateString()
    date: Date;

    @IsNotEmpty({message: 'La carga no puede estar vacia'})
    @IsInt({message: 'La carga debe ser un entero'})
    @IsPositive({message:'La carga debe ser un valor positiva'})
    load_up: number;

    @IsNotEmpty({message: 'Los contenerdores rotos no puede estar vacio'})
    @IsInt({message: 'Los contenerdores rotos debe ser un entero'})
    @IsPositive({message:'Los contenerdores rotos debe ser un valor positivo'})
    broken_containers: number;


    @IsNotEmpty({message:'El estado no puede estar vacio'})
    @IsEnum($Enums.distribution_status)
    status: $Enums.distribution_status;
    
    @IsNotEmpty({message:'El id de la ruta no puede estar vacio'})
    @IsInt({message:'El id de la ruta debe ser un numero entero'})
    @IsPositive({message: 'El id de la ruta debe ser positivo'})
    route_id: number;

    @IsNotEmpty({message:'El id del producto no puede estar vacio'})
    @IsInt({message:'El id del producto debe ser un numero entero'})
    @IsPositive({message: 'El id del producto debe ser positivo'})
    product_inventory_id: number;
}
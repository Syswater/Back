import { $Enums } from "@prisma/client";
import { Equals, IsBoolean, IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, IsPositive } from "class-validator";

export class UpdateDistributionInput{

    @IsNotEmpty({message:'El id no puede estar vacio'})
    @IsInt({message:'El id debe ser un numero entero'})
    @IsPositive({message: 'El id debe ser positivo'})
    id: number;

    @IsOptional()
    @IsDateString()
    date?: Date;

    @IsOptional()
    @IsInt({message: 'La carga debe ser un entero'})
    @IsPositive({message:'La carga debe ser un valor positiva'})
    load_up?: number;

    @IsOptional()
    @IsInt({message: 'Los contenerdores rotos debe ser un entero'})
    @IsPositive({message:'Los contenerdores rotos debe ser un valor positivo'})
    broken_containers?: number;


    @IsOptional()
    @IsEnum($Enums.distribution_status)
    status: $Enums.distribution_status;
    
    @IsOptional()
    @IsInt({message:'El id de la ruta debe ser un numero entero'})
    @IsPositive({message: 'El id de la ruta debe ser positivo'})
    route_id?: number;

    @IsOptional()
    @IsInt({message:'El id del producto debe ser un numero entero'})
    @IsPositive({message: 'El id del producto debe ser positivo'})
    product_inventory_id: number;

    @IsBoolean()
    @Equals(true, {message: 'Se debe proporcionar un id'})
    get isValid(): boolean{
        return !!this.id;
    }
}
import { $Enums } from "@prisma/client";
import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsPositive, Min } from "class-validator";

export class CreateTransactionContainer{

    @IsNotEmpty({message:'La fecha no puede estar vacia'})
    @IsDateString()
    date: Date;

    @IsNotEmpty({message:'El valor no puede estar vacio'})
    @IsInt({message:'El valor debe se un entero'})
    @IsPositive({message:'El valor debe ser positivo'})
    value: number;

    @IsNotEmpty({message:'El tipo no puede estar vacio'})
    @IsEnum($Enums.transaction_container_type)
    type: $Enums.transaction_container_type;

    @IsNotEmpty({message:'El id del cliente no puede estar vacio'})
    @IsInt({message:'El id del cliente debe ser un numero entero'})
    @IsPositive({message: 'El id del cliente debe ser positivo'})
    customer_id: number;

    @IsNotEmpty({message:'El id del usuario no puede estar vacio'})
    @IsInt({message:'El id del usuario debe ser un numero entero'})
    @IsPositive({message: 'El id del usuario debe ser positivo'})
    user_id: number;

    @IsNotEmpty({message:'El id del producto no puede estar vacio'})
    @IsInt({message:'El id del producto debe ser un numero entero'})
    @IsPositive({message: 'El id del producto debe ser positivo'})
    product_inventory_id: number;

}
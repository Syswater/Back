import { $Enums } from "@prisma/client";
import { IsEnum, IsInt, IsNotEmpty, IsPositive, Min } from "class-validator";

export class CreateSaleInput{

    @IsNotEmpty({message: 'La cantidad no puede estar vacia'})
    @IsInt({message: 'La cantidad debe ser un numero entero'})
    @IsPositive({message: 'La cantidad debe ser un valor positivo'})
    amount: number;

    @IsNotEmpty({message: 'El valor unitario no puede estar vacio'})
    @IsInt({message: 'El valor unitario debe ser un numero entero'})
    @IsPositive({message: 'El valor unitario debe ser un valor positivo'})
    unit_value: number;

    @IsNotEmpty({message: 'El valor pagado no puede estar vacio'})
    @IsInt({message: 'El valor pagado debe ser un numero entero'})
    @Min(0, {message: 'El valor pagado debe ser un valor positivo'})
    value_paid: number;

    @IsNotEmpty({ message: 'El metodo de pago no puede estar vacio' })
    @IsEnum($Enums.transaction_payment_payment_method)
    payment_method: $Enums.transaction_payment_payment_method;

    @IsNotEmpty({message: 'El id del cliente no puede estar vacio'})
    @IsInt({message: 'El id del cliente debe ser un numero entero'})
    @IsPositive({message: 'El id del cliente debe ser un valor positivo'})
    customer_id: number;

    @IsNotEmpty({message: 'El id de la distribucion no puede estar vacia'})
    @IsInt({message: 'El id de la distribucion debe ser un numero entero'})
    @IsPositive({message: 'El id de la distribucion debe ser un valor positivo'})
    distribution_id: number;

    @IsNotEmpty({message: 'El id del usuario no puede estar vacio'})
    @IsInt({message: 'El id del usuario debe ser un numero entero'})
    @IsPositive({message: 'El id del usuario debe ser un valor positivo'})
    user_id: number;

    @IsNotEmpty({message: 'El id del producto no puede estar vacio'})
    @IsInt({message: 'El id del producto debe ser un numero entero'})
    @IsPositive({message: 'El id del producto debe ser un valor positivo'})
    product_inventory_id: number;
}
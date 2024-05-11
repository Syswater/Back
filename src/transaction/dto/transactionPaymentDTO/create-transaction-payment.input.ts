import { $Enums } from "@prisma/client";
import { IsNotEmpty, IsDateString, IsInt, IsPositive, IsEnum, Min } from "class-validator";

export class CreateTransactionPayment {

    @IsNotEmpty({ message: 'La fecha no puede estar vacia' })
    @IsDateString()
    date: Date;

    @IsNotEmpty({ message: 'El valor no puede estar vacio' })
    @IsInt({ message: 'El valor debe se un entero' })
    @IsPositive({ message: 'El valor debe ser positivo' })
    value: number;

    @IsNotEmpty({ message: 'El tipo no puede estar vacio' })
    @IsEnum($Enums.transaction_payment_type)
    type: $Enums.transaction_payment_type;

    @IsNotEmpty({ message: 'El metodo de pago no puede estar vacio' })
    @IsEnum($Enums.transaction_payment_payment_method)
    payment_method: $Enums.transaction_payment_payment_method;

    @IsNotEmpty({ message: 'El id del cliente no puede estar vacio' })
    @IsInt({ message: 'El id del cliente debe ser un numero entero' })
    @IsPositive({ message: 'El id del cliente debe ser positivo' })
    customer_id: number;

    @IsNotEmpty({ message: 'El id del usuario no puede estar vacio' })
    @IsInt({ message: 'El id del usuario debe ser un numero entero' })
    @IsPositive({ message: 'El id del usuario debe ser positivo' })
    user_id: number;
}
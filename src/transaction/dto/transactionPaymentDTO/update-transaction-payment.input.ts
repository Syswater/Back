import { $Enums } from "@prisma/client";
import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, IsPositive, Min } from "class-validator";

export class UpdateTransactionPaymentInput{

    @IsNotEmpty({message: 'El id no puede estar vacio'})
    @IsInt({message: 'El debe ser un numero entero'})
    @IsPositive({message: 'El debe ser un entero positivo'})
    id: number;

    @IsOptional()
    @IsDateString()
    date?: Date;

    @IsOptional()
    @IsInt({ message: 'El valor debe se un entero' })
    @Min(0, { message: 'El valor debe ser positivo' })
    value?: number;

    @IsOptional()
    @IsEnum($Enums.transaction_payment_type)
    type?: $Enums.transaction_payment_type;

    @IsOptional()
    @IsEnum($Enums.transaction_payment_payment_method)
    payment_method?: $Enums.transaction_payment_payment_method;

}
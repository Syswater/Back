import { IsBoolean, IsInt, IsNotEmpty, IsPositive, IsString } from "class-validator";

export class CreateProductInput{
    @IsNotEmpty({message:'El nombre del producto no puede estar vacio'})
    @IsString({message:'El nombre del producto debe ser un string'})
    product_name: string;

    @IsNotEmpty({message:'La cantidad no puede estar vacia'})
    @IsInt({message:'La cantidad debe ser un entero'})
    @IsPositive({message: 'La cantidad debe ser un valor positivo'})
    amount: number;

    @IsBoolean({message:'El campo is_container debe ser boolean'})
    @IsNotEmpty({message: 'El campor is_container no puede estar vacio'})
    is_container: boolean;
}
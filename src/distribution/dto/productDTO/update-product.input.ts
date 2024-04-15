import { Equals, IsBoolean, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString } from "class-validator";

export class UpdateProductInput{

    @IsNotEmpty({message:'El id no puede estar vacio'})
    @IsInt({message:'El id debe ser un entero'})
    @IsPositive({message:'El id debe ser un valor positivo'})
    id:number;

    @IsOptional()
    @IsString({message:'El nombre del producto debe ser un string'})
    product_name?: string;

    @IsOptional()
    @IsInt({message:'La cantidad debe ser un entero'})
    @IsPositive({message: 'La cantidad debe ser un valor positivo'})
    amount?: number;

    @IsOptional()
    @IsBoolean({message:'El campo is_container debe ser boolean'})
    is_container?: boolean;

    @IsBoolean()
    @Equals(true, { message: 'Se debe proporcionar un id' })
    get isValid(): boolean {
        return !!this.id;
    }
}
import { IsNotEmpty, IsInt, IsPositive, IsOptional, IsBoolean, Equals } from "class-validator";

export class UpdateSaleInput{

    @IsNotEmpty({message: 'El id no puede estar vacio'})
    @IsInt({message: 'El id debe ser un numero entero'})
    @IsPositive({message: 'El id debe ser un valor positivo'})
    id: number;

    @IsOptional()
    @IsInt({message: 'La cantidad debe ser un numero entero'})
    @IsPositive({message: 'La cantidad debe ser un valor positivo'})
    amount?: number;

    @IsOptional()
    @IsInt({message: 'El valor unitario debe ser un numero entero'})
    @IsPositive({message: 'El valor unitario debe ser un valor positivo'})
    unit_value?: number;

    @IsBoolean()
    @Equals(true, { message: 'Se debe proporcionar un id' })
    get isValid(): boolean {
        return !!this.id;
    }
}
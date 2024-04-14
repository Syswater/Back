import { IsNotEmpty, IsInt, IsPositive, IsDate, IsString, IsBoolean, Equals, IsOptional } from "class-validator";

export class UpdateOrderInput{

    @IsNotEmpty({message: 'El id no puede estar vacio'})
    @IsInt({message: 'El debe ser un numero entero'})
    @IsPositive({message: 'El debe ser un entero positivo'})
    id: number;

    @IsOptional()
    @IsInt({message: 'La cantidad debe ser un numero entero'})
    @IsPositive({message: 'La cantidad debe ser un entero positivo'})
    amount?: number;

    @IsDate({message: 'La fecha debe ser tener un formaro de fecha valida'})
    @IsOptional()
    date?: Date;

    @IsOptional()
    @IsString({message: 'El tipo de tapa debe ser un string'})
    tape_type?: string;

    @IsBoolean()
    @Equals(true, { message: 'Se debe proporcionar un id' })
    get isValid(): boolean {
        return !!this.id;
    }
}
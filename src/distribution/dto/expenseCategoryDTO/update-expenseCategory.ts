import { IsNotEmpty, IsInt, IsPositive, IsString, IsBoolean, Equals } from "class-validator";

export class UpdateExpenseCategoryInput{

    @IsNotEmpty({message:'El id no puede estar vacio'})
    @IsInt({message:'El id debe ser un numero entero'})
    @IsPositive({message: 'El id debe ser positivo'})
    id: number;

    @IsNotEmpty({message: 'El tipo de gasto no puede estar vacio'})
    @IsString({message: 'El tipo de gasto debe ser un string'})
    type:string;

    @IsBoolean()
    @Equals(true, { message: 'Se debe proporcionar un id' })
    get isValid(): boolean {
        return !!this.id;
    }
}
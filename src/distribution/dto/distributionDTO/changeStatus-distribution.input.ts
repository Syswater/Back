import { $Enums } from "@prisma/client";
import { IsNotEmpty, IsInt, IsPositive, IsOptional, IsEnum, IsBoolean, Equals } from "class-validator";

export class ChangeStatusDistributionInput{
    
    @IsNotEmpty({message:'El id no puede estar vacio'})
    @IsInt({message:'El id debe ser un numero entero'})
    @IsPositive({message: 'El id debe ser positivo'})
    id: number;

    @IsOptional()
    @IsEnum($Enums.distribution_status)
    status: $Enums.distribution_status;
    

    @IsBoolean()
    @Equals(true, {message: 'Se debe proporcionar un id'})
    get isValid(): boolean{
        return !!this.id;
    }
}
import { customer_tape_preference } from "@prisma/client";
import { IsPositive, IsInt, IsNotEmpty, IsBoolean, Equals, IsEnum, IsString, IsOptional } from "class-validator";

export class UpdateCustomerInput {

    @IsPositive({ message: "El id debe ser un numero positivo" })
    @IsInt({ message: "El id debe ser un numero entero" })
    @IsNotEmpty({ message: "El id no puede estar vacio" })
    id: number

    @IsString()
    @IsOptional()
    address?: string;

    @IsString()
    @IsOptional()
    neighborhood?: string;

    @IsInt({ message: 'El orden de la ruta debe ser un numero entero.' })
    @IsOptional()
    @IsPositive({ message: 'El orden de la ruta debe ser un valor positivo.' })
    route_order?: number;

    @IsOptional()
    @IsEnum(customer_tape_preference)
    tape_preference?: customer_tape_preference;

    @IsOptional()
    @IsBoolean({ message: 'El campo de contacto debe ser boolean' })
    is_contactable?: boolean;

    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    cellphone?: string;

    @IsOptional()
    @IsInt({message:'El id de la ruta debe ser un numero entero'})
    @IsPositive({message: 'El id de la ruta debe ser positivo'})
    route_id?: number;

    @IsBoolean()
    @Equals(true, { message: 'Se debe proporcionar un id' })
    get isValid(): boolean {
        return !!this.id;
    }
}
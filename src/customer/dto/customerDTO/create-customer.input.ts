import { IsArray, IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString } from "class-validator";
import { TapePreference } from "src/constants/tape_preference";

export class CreateCustomerInput {

    @IsString()
    @IsNotEmpty( {message: 'La direccion no puede estar vacia.' } )
    address: string;

    @IsString()
    @IsNotEmpty( {message: 'El barrio no puede estar vacia.' } )
    neighborhood: string;

    @IsInt({message: 'El orden de la ruta debe ser un numero entero.'})
    @IsNotEmpty( {message: 'El orden de la ruta no puede estar vacia.' } )
    @IsPositive({message: 'El orden de la ruta debe ser un valor positivo.'})
    route_order: number;

    @IsNotEmpty( {message: 'La preferencia de tapa no puede estar vacia.' } )
    @IsEnum(TapePreference)
    tape_preference: TapePreference;

    @IsNotEmpty( {message: 'El campo de contacto no puede estar vacia.' } )
    @IsBoolean( {message: 'El campo de contacto debe ser boolean'} )
    is_contactable: boolean;

    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    cellphone?: string;

    @IsInt({message: 'El id de ruta debe ser un numero entero.'})
    @IsNotEmpty( {message: 'El id de ruta no puede estar vacia.' } )
    @IsPositive({message: 'El id de ruta debe ser un valor positivo.'})
    route_id: number;
}
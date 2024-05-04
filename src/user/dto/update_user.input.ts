import { ArrayMinSize, IsArray, IsEnum, IsInt, IsNotEmpty, IsNumber, IsNumberString, IsOptional, IsPositive, IsString } from "class-validator";
import { Role } from "../../constants/role";

export class UpdateUserInput {

    @IsNumber()
    @IsPositive()
    @IsInt({ message: "El id debe ser un numero entero" })
    id: number

    @IsNotEmpty({ message: 'El nombre no debe estar vacío' })
    @IsString()
    @IsOptional()
    name: string;

    @IsNumberString()
    @IsNotEmpty({ message: 'El numero de celular no puiede estar vacío' })
    @IsOptional()
    cellphone: string;

    @IsEnum(Role, { each: true })
    @IsArray({ message: 'Los roles del usuario deben estar en un arreglo' })
    @ArrayMinSize(1, { message: 'El usuario debe tener al menos un rol' })
    @IsOptional()
    roles: Role[];
}
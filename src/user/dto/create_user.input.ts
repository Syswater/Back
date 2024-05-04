import { ArrayMinSize, IsArray, IsEnum, IsNotEmpty, IsNumberString, IsString, IsStrongPassword, Min, MinLength } from "class-validator";
import { Role } from "../../constants/role";

export class CreateUserInput {
    @IsNotEmpty({ message: 'El nombre no debe estar vacío' })
    @IsString()
    name: string;

    @IsNumberString()
    @IsNotEmpty({ message: 'El numero de celular no puiede estar vacío' })
    cellphone: string;

    @IsString()
    @IsNotEmpty({ message: 'El nombre de usuario no debe estar vacío' })
    username: string;


    @IsString()
    @IsNotEmpty({ message: 'La contraseña no debe estar vacía' })
    password: string;

    @IsEnum(Role, { each: true })
    @IsArray({ message: 'Los roles del usuario deben estar en un arreglo' })
    @ArrayMinSize(1, { message: 'El usuario debe tener al menos un rol' })
    roles: Role[];
}
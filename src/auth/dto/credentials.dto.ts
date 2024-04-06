import { IsString, MinLength } from "class-validator";

export class CredentialsDto {
    @IsString({ message: "El nombre de usuario debe ser una cadena de texto" })
    username: string;

    @IsString({ message: "La contraseña debe ser una cadena de texto" })
    @MinLength(5, { message: "La contraseña debe tener al menos 5 caracteres" })
    password: string;
}
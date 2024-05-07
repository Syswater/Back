import { IsString, IsStrongPassword } from "class-validator"

export class ChangePassword {
    @IsString()
    oldPassword: string;

    @IsStrongPassword()
    newPaswword: string;
}
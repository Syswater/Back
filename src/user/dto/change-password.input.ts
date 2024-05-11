import { IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';

export class ChangePasswordInput {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @IsNotEmpty()
  newPassword: string;
}

import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SearchUserInput {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  filter: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  role: string;
}

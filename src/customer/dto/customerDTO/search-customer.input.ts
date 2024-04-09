import { IsString, IsNotEmpty, IsOptional } from "class-validator";

export class SearchCustomerInput{
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    filter: string;
}
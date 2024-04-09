import { IsString, IsNotEmpty, IsOptional } from "class-validator";

export class SearchNoteInput{
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    filter: string;
}
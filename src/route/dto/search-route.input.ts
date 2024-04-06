import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class SearchRouteInput {
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    filter: string;
}
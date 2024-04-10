import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class SearchRouteInput {
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    filter: string;

    @IsBoolean()
    @IsNotEmpty()
    @IsOptional()
    whit_status?: boolean | false;
}
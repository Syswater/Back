import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { RouteStatus } from "../../constants/route-status";

export class SearchRouteInput {
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    filter: string;

    @IsBoolean()
    @IsNotEmpty()
    @IsOptional()
    whit_status?: boolean | false;

    @IsEnum(RouteStatus)
    status?: RouteStatus
}
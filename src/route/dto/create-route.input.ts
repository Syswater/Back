import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { Weekday } from "../../constants/weekday";

export class CreateRouteInput {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    location: string;

    @IsArray()
    @IsNotEmpty()
    @IsEnum(Weekday, { each: true })
    weekdays: Weekday[];

    @IsNumber()
    price: number;
}
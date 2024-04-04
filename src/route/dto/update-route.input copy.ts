import { Equals, IsArray, IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { Weekday } from "../../constants/weekday";

export class UpdateRouteInput {

    @IsNumber()
    id: number

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    name?: string | null;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    location?: string | null;


    @IsArray()
    @IsNotEmpty()
    @IsEnum(Weekday, { each: true })
    @IsOptional()
    weekdays: Weekday[];

    @IsNumber()
    @IsOptional()
    price?: number | null;

    @IsBoolean()
    @Equals(true, { message: 'Se debe proporcionar un id' })
    get isValid(): boolean {
        return !!this.id;
    }
}
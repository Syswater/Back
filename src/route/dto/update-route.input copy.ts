import { Equals, IsArray, IsBoolean, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from "class-validator";
import { Weekday } from "../../constants/weekday";

export class UpdateRouteInput {

    @IsNumber()
    @IsPositive()
    @IsInt({ message: "El id debe ser un numero entero" })
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
    weekdays?: Weekday[];

    @IsNumber()
    @IsOptional()
    price?: number | null;

    @IsBoolean()
    @Equals(true, { message: 'Se debe proporcionar un id' })
    get isValid(): boolean {
        return !!this.id;
    }
}
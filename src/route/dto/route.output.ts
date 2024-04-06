import { Weekday } from "../../constants/weekday";

export class RouteDto {
    id: number;
    name: string;
    location: string;
    weekdays: Weekday[];
    price: number;
}
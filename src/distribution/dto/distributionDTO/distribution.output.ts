import { $Enums } from "@prisma/client";
import { RouteDto } from "src/route/dto/route.output";

export class DistributionDto{
    id: number;
    date: Date;
    load_up: number;
    broken_containers: number;
    status: $Enums.distribution_status;
    route_id: number;
    product_inventory_id: number;
    route?: RouteDto;
}
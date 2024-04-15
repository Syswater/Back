import { $Enums, distribution } from "@prisma/client";

export class Distribution implements distribution{
    id: number;
    date: Date;
    load_up: number;
    broken_containers: number;
    update_at: Date;
    status: $Enums.distribution_status;
    delete_at: Date;
    route_id: number;
    product_inventory_id: number;
}
import { $Enums, customer } from "@prisma/client";

export class Customer implements customer {
    id: number;
    address: string;
    neighborhood: string;
    route_order: number;
    tape_preference: $Enums.customer_tape_preference;
    is_contactable: number;
    name: string;
    cellphone: string;
    update_at: Date;
    delete_at: Date;
    route_id: number;
}
import { customer_tape_preference } from "@prisma/client";

export class CustomerDto {
    id: number;
    address: string;
    neighborhood: string;
    route_order: number;
    tape_preference: customer_tape_preference;
    is_contactable: boolean;
    name: string | null;
    cellphone: string | null;
    route_id: number;
}
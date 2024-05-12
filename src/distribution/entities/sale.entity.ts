import { sale } from "@prisma/client";

export class Sale implements sale {
    id: number;
    date: Date;
    amount: number;
    unit_value: number;
    update_at: Date;
    delete_at: Date;
    value_paid: number;
    customer_id: number;
    distribution_id: number;
    user_id: number;
    product_inventory_id: number;
}
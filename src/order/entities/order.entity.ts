import { order } from "@prisma/client";

export class Order implements order{
    id: number;
    amount: number;
    date: Date;
    tape_type: string;
    update_at: Date;
    delete_at: Date;
    customer_id: number;
    distribution_id: number;
}
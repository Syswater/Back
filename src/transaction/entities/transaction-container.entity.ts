import { $Enums, transaction_container } from "@prisma/client";

export class TransactionContainer implements transaction_container{
    id: number;
    date: Date;
    value: number;
    type: $Enums.transaction_container_type;
    total: number;
    update_at: Date;
    delete_at: Date;
    customer_id: number;
    user_id: number;
    product_inventory_id: number;
}
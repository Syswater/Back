import { product_inventory } from "@prisma/client";

export class ProductInventory implements product_inventory{
    id: number;
    product_name: string;
    amount: number;
    is_container: number;
    update_at: Date;
    delete_at: Date;
}
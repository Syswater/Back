import { $Enums, transaction_payment } from "@prisma/client";

export class TransactionPayment implements transaction_payment {
    sale_id: number;
    id: number;
    date: Date;
    value: number;
    type: $Enums.transaction_payment_type;
    payment_method: $Enums.transaction_payment_payment_method;
    total: number;
    update_at: Date;
    delete_at: Date;
    user_id: number;
}
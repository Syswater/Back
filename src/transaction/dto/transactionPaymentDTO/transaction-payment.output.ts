import { $Enums } from "@prisma/client";

export class TransactionPaymentDto{
    id: number;
    date: Date;
    value: number;
    type: $Enums.transaction_payment_type;
    payment_method: $Enums.transaction_payment_payment_method;
    total: number;
    customer_id: number;
    user_id: number;
}
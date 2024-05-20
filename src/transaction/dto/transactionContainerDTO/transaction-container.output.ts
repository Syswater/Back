import { $Enums } from '@prisma/client';

export class TransactionContainerDto {
  id: number;
  date: Date;
  value: number;
  type: $Enums.transaction_container_type;
  total: number;
  customer_id: number;
  user_id: number;
  product_inventory_id: number;
  user_name: string;
}

import { $Enums } from '@prisma/client';

export class ContainerReport {
  total_broken: number;
  total_borrowed: number;
  total_returned: number;
  per_type: {
    id: number;
    product_name: string;
    type: $Enums.transaction_container_type | "BROKEN";
    value: number;
  }[];
}

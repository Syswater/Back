export class ContainerReport {
  total_in_inventory: number;
  total_borrowed: number;
  total_returned: number;
  total_broken: number;
  per_type: {
    id: number;
    product_name: string;
    borrowed: number;
    returned: number;
    broken: number;
    total_in_inventory: number;
  }[];
}

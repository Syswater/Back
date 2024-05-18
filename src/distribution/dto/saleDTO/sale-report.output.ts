export class SaleReport {
  total: number;
  per_method: { method: string; value: number; date: string }[];
  debt: number;
  quantitySold: number;
}

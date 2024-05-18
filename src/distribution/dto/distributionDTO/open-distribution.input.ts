import { IsArray, IsInt, IsPositive, Min } from 'class-validator';

export class OpenDistributionInput {
  @IsInt()
  @IsPositive()
  distribution_id: number;

  @IsInt()
  @IsPositive()
  load: number;

  @IsInt()
  @IsPositive()
  product_inventory_id: number;

  @IsInt({ each: true })
  @IsPositive({ each: true })
  @IsArray()
  distributors_ids: number[];
}

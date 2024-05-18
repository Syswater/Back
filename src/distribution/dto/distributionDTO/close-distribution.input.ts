import { IsInt, IsPositive } from 'class-validator';

export class CloseDistributionInput {
  @IsInt()
  @IsPositive()
  distribution_id: number;
}

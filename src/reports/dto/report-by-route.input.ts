import { IsDateString, IsInt, IsNotEmpty, IsPositive } from 'class-validator';

export class ReportByRouteInput {
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  route_id: number;

  @IsDateString()
  @IsNotEmpty()
  initDate: Date;

  @IsDateString()
  @IsNotEmpty()
  endDate: Date;
}

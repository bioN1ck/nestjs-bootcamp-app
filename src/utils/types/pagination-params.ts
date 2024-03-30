import { IsNumber, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class PaginationParams {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  public offset?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  public limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  public startId?: number;
}

export default PaginationParams;

import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class FindAllPositionConfigurationsDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(-1)
  limit?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(['id', 'position', 'responseTimeInDays', 'createdAt'])
  sortField?: 'id' | 'position' | 'responseTimeInDays' | 'createdAt';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortDirection?: 'asc' | 'desc';
}

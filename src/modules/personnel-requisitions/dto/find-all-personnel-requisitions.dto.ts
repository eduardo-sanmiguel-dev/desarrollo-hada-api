import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class FindAllPersonnelRequisitionsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(-1)
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  areaId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  positionRequiredId?: number;

  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true' || value === '1')
  @IsBoolean()
  isAuthorized?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true' || value === '1')
  @IsBoolean()
  excludeFullCompliance?: boolean;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn([
    'id',
    'requestDate',
    'createdAt',
    'numberOfVacancies',
    'isExternal',
    'reasonForRequest',
    'area',
    'requestingUser',
    'positionRequestingUser',
    'workplace',
    'positionRequired',
  ])
  sortField?:
    | 'id'
    | 'requestDate'
    | 'createdAt'
    | 'numberOfVacancies'
    | 'isExternal'
    | 'reasonForRequest'
    | 'area'
    | 'requestingUser'
    | 'positionRequestingUser'
    | 'workplace'
    | 'positionRequired';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortDirection?: 'asc' | 'desc';
}

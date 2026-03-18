import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class FindAllPersonnelRequisitionsDto {
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

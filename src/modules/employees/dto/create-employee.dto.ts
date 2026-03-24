import { Type } from 'class-transformer';
import {
  IsDate,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateEmployeeDto {
  @IsNumber()
  readonly code: number;

  @IsString()
  readonly name: string;

  @Type(() => Date)
  @IsDate()
  readonly birthdate: Date;

  @Type(() => Date)
  @IsDate()
  readonly dateOfAdmission: Date;

  @IsPositive()
  readonly areaId: number;

  @IsPositive()
  readonly positionId: number;

  @IsPositive()
  readonly genderId: number;

  @IsOptional()
  @IsPositive()
  readonly personnelRequisitionId?: number;
}

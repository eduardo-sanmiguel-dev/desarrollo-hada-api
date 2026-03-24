import { IsDate, IsNumber, IsPositive, IsString } from 'class-validator';
import { Type } from 'class-transformer';

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
}

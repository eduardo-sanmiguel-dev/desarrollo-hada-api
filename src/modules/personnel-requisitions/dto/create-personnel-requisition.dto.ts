import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreatePersonnelRequisitionDto {
  @IsPositive()
  readonly areaId: number;

  @IsPositive()
  readonly workplaceId: number;

  @IsPositive()
  readonly positionRequiredId: number;

  @IsPositive()
  readonly numberOfVacancies: number;

  @IsBoolean()
  readonly isExternal: boolean;

  @IsPositive()
  reasonForRequestId: number;

  @IsOptional()
  @IsArray()
  @IsPositive({ each: true })
  readonly usersRemplaced?: number[];

  @IsOptional()
  @IsString()
  readonly projectReplacedName?: string;

  @IsOptional()
  @IsString()
  readonly observations?: string;
}

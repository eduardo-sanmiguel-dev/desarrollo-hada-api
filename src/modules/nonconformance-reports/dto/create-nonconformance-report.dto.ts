import { IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class CreateNonconformanceReportDto {
  @IsPositive()
  readonly employeeId: number;

  @IsString()
  @IsNotEmpty()
  readonly deviation: string;

  @IsString()
  @IsNotEmpty()
  readonly nonconformance: string;

  @IsString()
  @IsNotEmpty()
  readonly signatureBase64: string;
}

import { ArrayNotEmpty, IsArray, IsPositive } from 'class-validator';

export class ExportNonconformanceReportsExcelDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsPositive({ each: true })
  readonly ids: number[];
}

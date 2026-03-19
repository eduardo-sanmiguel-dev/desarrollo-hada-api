import { IsPositive } from 'class-validator';

export class CreatePositionConfigurationDto {
  @IsPositive()
  positionId: number;

  @IsPositive()
  responseTime: number;
}

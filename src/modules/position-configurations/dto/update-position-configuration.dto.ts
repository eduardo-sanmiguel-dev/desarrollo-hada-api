import { PartialType } from '@nestjs/mapped-types';
import { CreatePositionConfigurationDto } from './create-position-configuration.dto';

export class UpdatePositionConfigurationDto extends PartialType(CreatePositionConfigurationDto) {}

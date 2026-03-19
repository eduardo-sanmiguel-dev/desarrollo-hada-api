import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

import { PositionConfigurationsController } from './position-configurations.controller';
import { PositionConfigurationsService } from './position-configurations.service';
import { PositionConfiguration } from './entities/position-configuration.entity';
import { EmployeePosition } from '../employees/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([PositionConfiguration, EmployeePosition]),
  ],
  controllers: [PositionConfigurationsController],
  providers: [PositionConfigurationsService],
  exports: [TypeOrmModule, PositionConfigurationsService],
})
export class PositionConfigurationsModule {}

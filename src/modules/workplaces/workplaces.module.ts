import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

import { WorkplacesSeedService } from './workplaces.seed.service';
import { WorkplacesController } from './workplaces.controller';
import { WorkplacesService } from './workplaces.service';
import { Workplace } from './entities/workplace.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Workplace])],
  controllers: [WorkplacesController],
  providers: [WorkplacesService, WorkplacesSeedService],
  exports: [TypeOrmModule, WorkplacesService],
})
export class WorkplacesModule {}

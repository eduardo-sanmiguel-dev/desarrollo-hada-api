import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

import { AreasSeedService } from './areas.seed.service';
import { AreasController } from './areas.controller';
import { AreasService } from './areas.service';
import { Area } from './entities/area.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Area])],
  controllers: [AreasController],
  providers: [AreasService, AreasSeedService],
  exports: [TypeOrmModule, AreasService],
})
export class AreasModule {}

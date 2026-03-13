import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

import { PersonnelRequisitionsController } from './personnel-requisitions.controller';
import { PersonnelRequisitionsService } from './personnel-requisitions.service';
import { PersonnelRequisition } from './entities/personnel-requisition.entity';
import { Project } from '../projects/entities/project.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PersonnelRequisition, Project])],
  controllers: [PersonnelRequisitionsController],
  providers: [PersonnelRequisitionsService],
  exports: [TypeOrmModule, PersonnelRequisitionsService],
})
export class PersonnelRequisitionsModule {}

import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

import { PersonnelRequisitionsController } from './personnel-requisitions.controller';
import { PersonnelRequisitionsService } from './personnel-requisitions.service';
import { PersonnelRequisition } from './entities/personnel-requisition.entity';
import { Project } from '../projects/entities/project.entity';
import { User } from '../users/entities/user.entity';
import { Employee } from '../employees/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([PersonnelRequisition, Project, Employee, User]),
  ],
  controllers: [PersonnelRequisitionsController],
  providers: [PersonnelRequisitionsService],
  exports: [TypeOrmModule, PersonnelRequisitionsService],
})
export class PersonnelRequisitionsModule {}

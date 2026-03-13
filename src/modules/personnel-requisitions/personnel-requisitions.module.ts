import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

import { PersonnelRequisitionsController } from './personnel-requisitions.controller';
import { PersonnelRequisitionsService } from './personnel-requisitions.service';
import { PersonnelRequisition } from './entities/personnel-requisition.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PersonnelRequisition])],
  controllers: [PersonnelRequisitionsController],
  providers: [PersonnelRequisitionsService],
  exports: [TypeOrmModule, PersonnelRequisitionsService],
})
export class PersonnelRequisitionsModule {}

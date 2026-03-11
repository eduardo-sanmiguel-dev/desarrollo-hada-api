import { Module } from '@nestjs/common';

import { PersonnelRequisitionsController } from './personnel-requisitions.controller';
import { PersonnelRequisitionsService } from './personnel-requisitions.service';

@Module({
  controllers: [PersonnelRequisitionsController],
  providers: [PersonnelRequisitionsService],
})
export class PersonnelRequisitionsModule {}

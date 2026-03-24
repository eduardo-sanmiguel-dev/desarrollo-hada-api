import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

import { EmployeesSeedService } from './employees.seed.service';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';
import { PersonnelRequisition } from '../personnel-requisitions/entities/personnel-requisition.entity';
import {
  Employee,
  EmployeeArea,
  EmployeePosition,
  EmployeeGenre,
} from './entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Employee,
      EmployeeArea,
      EmployeePosition,
      EmployeeGenre,
      PersonnelRequisition,
    ]),
  ],
  controllers: [EmployeesController],
  providers: [EmployeesService, EmployeesSeedService],
  exports: [TypeOrmModule, EmployeesService],
})
export class EmployeesModule {}

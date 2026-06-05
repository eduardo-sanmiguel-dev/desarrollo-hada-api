import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

import { Employee } from '../employees/entities/employee.entity';
import { User } from '../users/entities/user.entity';
import { NonconformanceReport } from './entities/nonconformance-report.entity';
import { NonconformanceReportsController } from './nonconformance-reports.controller';
import { NonconformanceReportsService } from './nonconformance-reports.service';

@Module({
  imports: [TypeOrmModule.forFeature([NonconformanceReport, Employee, User])],
  controllers: [NonconformanceReportsController],
  providers: [NonconformanceReportsService],
  exports: [TypeOrmModule, NonconformanceReportsService],
})
export class NonconformanceReportsModule {}

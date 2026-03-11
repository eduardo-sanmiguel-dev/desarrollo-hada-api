import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

import { ReasonsForRequestSeedService } from './reasons-for-request.seed.service';
import { ReasonsForRequestController } from './reasons-for-request.controller';
import { ReasonsForRequestService } from './reasons-for-request.service';
import { ReasonForRequest } from './entities/reasons-for-request.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ReasonForRequest])],
  controllers: [ReasonsForRequestController],
  providers: [ReasonsForRequestService, ReasonsForRequestSeedService],
  exports: [TypeOrmModule, ReasonsForRequestService],
})
export class ReasonsForRequestModule {}

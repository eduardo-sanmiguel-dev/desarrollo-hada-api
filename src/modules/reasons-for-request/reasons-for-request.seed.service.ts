import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ReasonForRequest } from './entities/reasons-for-request.entity';

@Injectable()
export class ReasonsForRequestSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(ReasonsForRequestSeedService.name);

  constructor(
    @InjectRepository(ReasonForRequest)
    private readonly reasonsForRequestRepository: Repository<ReasonForRequest>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const data = [
      { name: 'Reemplazo por finalización de contrato' },
      { name: 'Reemplazo por crecimiento interno' },
      { name: 'Incremento temporal de labores por la operación' },
      { name: 'Incremento de plantilla/ nuevo proceso/ nuevo proyecto' },
      { name: 'Reemplazo por vacaciones/ licencias/incapacidad' },
    ];

    for (const { name } of data) {
      const existing = await this.reasonsForRequestRepository.findOne({
        where: { name },
      });

      if (existing) {
        continue;
      }

      await this.reasonsForRequestRepository.save({
        name,
        createdBy: {
          id: 1,
        },
      });
    }

    this.logger.log(`Reasons for request iniciales creadas: ${data.length}`);
  }
}

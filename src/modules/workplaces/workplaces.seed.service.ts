import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Workplace } from './entities/workplace.entity';

@Injectable()
export class WorkplacesSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(WorkplacesSeedService.name);

  constructor(
    @InjectRepository(Workplace)
    private readonly workplacesRepository: Repository<Workplace>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const data = [
      { name: 'BARRANQUILLA - HADA INTERNATIONAL' },
      { name: 'MANIZALES - HADA INTERNATIONAL' },
      { name: 'MÉXICO - COSMETICOS TRUJILLO' },
    ];

    for (const { name } of data) {
      const existing = await this.workplacesRepository.findOne({
        where: { name },
      });

      if (existing) {
        continue;
      }

      await this.workplacesRepository.save({
        name,
        createdBy: {
          id: 1,
        },
      });
    }

    this.logger.log(`Workplaces iniciales creadas: ${data.length}`);
  }
}

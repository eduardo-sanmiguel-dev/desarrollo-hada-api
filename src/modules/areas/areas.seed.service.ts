import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Area } from './entities/area.entity';

@Injectable()
export class AreasSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AreasSeedService.name);

  constructor(
    @InjectRepository(Area)
    private readonly areasRepository: Repository<Area>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const data = [
      { name: 'PRODUCCIÓN SOLIDOS' },
      { name: 'PRODUCCIÓN LIQUIDOS' },
      { name: 'SAPONIFICACIÓN Y SECADO' },
      { name: 'MANTENIMIENTO' },
      { name: 'INGENIERIA Y PROYECÑTOS' },
      { name: 'CALIDAD' },
      { name: 'LOGISTICA' },
      { name: 'COMERCIAL' },
      { name: 'ABASTECIMIENTO' },
      { name: 'ADMINISTRACIÓN ' },
      { name: 'ECOFIRE' },
      { name: 'GESTIÓN HUMANA' },
      { name: 'PRODUCCIÓN PERFUMERIA' },
      { name: 'INNOVACIÓN ' },
      { name: 'SISTEMA INTEGRADO DE GESTIÓN' },
      { name: 'TIC' },
    ];

    for (const { name } of data) {
      const existing = await this.areasRepository.findOne({
        where: { name },
      });

      if (existing) {
        continue;
      }

      await this.areasRepository.save({
        name,
        createdBy: {
          id: 1,
        },
      });
    }

    this.logger.log(`Áreas iniciales creadas: ${data.length}`);
  }
}

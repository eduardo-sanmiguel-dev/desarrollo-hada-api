import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { PositionConfiguration } from './entities/position-configuration.entity';
import { EmployeePosition } from '../employees/entities';
import { User } from '../users/entities/user.entity';
import {
  CreatePositionConfigurationDto,
  UpdatePositionConfigurationDto,
} from './dto';

@Injectable()
export class PositionConfigurationsService {
  private readonly logger = new Logger(PositionConfigurationsService.name);
  private readonly relations = [
    'createdBy',
    'updatedBy',
    'deletedBy',
    'position',
  ];

  constructor(
    @InjectRepository(PositionConfiguration)
    private readonly positionConfigurationsRepository: Repository<PositionConfiguration>,
    @InjectRepository(EmployeePosition)
    private readonly employeePositionsRepository: Repository<EmployeePosition>,
  ) {}

  async validatePosition(positionId: number): Promise<EmployeePosition> {
    const position = await this.employeePositionsRepository.findOne({
      where: { id: positionId },
    });

    if (!position) {
      throw new NotFoundException(
        `El puesto con ID ${positionId} no fue encontrada.`,
      );
    }

    return position;
  }

  async create(
    createPositionConfigurationDto: CreatePositionConfigurationDto,
    userId: number,
  ) {
    const { positionId, responseTime } = createPositionConfigurationDto;
    const position = await this.validatePosition(positionId);

    const positionConfiguration = this.positionConfigurationsRepository.create({
      responseTime,
      position,
      createdBy: { id: userId },
    });

    return this.positionConfigurationsRepository.save(positionConfiguration);
  }

  findAll() {
    return this.positionConfigurationsRepository.find({
      relations: this.relations,
    });
  }

  async findOne(id: number) {
    const positionConfiguration =
      await this.positionConfigurationsRepository.findOne({
        where: { id },
        relations: this.relations,
      });

    if (!positionConfiguration) {
      throw new NotFoundException(
        `La configuración de puesto con ID ${id} no fue encontrada.`,
      );
    }

    return positionConfiguration;
  }

  async update(
    id: number,
    updatePositionConfigurationDto: UpdatePositionConfigurationDto,
    userId: number,
  ) {
    await this.findOne(id);

    const { positionId = 0, responseTime = 0 } = updatePositionConfigurationDto;

    const position = await this.validatePosition(positionId);

    await this.positionConfigurationsRepository.update(id, {
      responseTime,
      position,
      updatedBy: { id: userId },
    });

    return this.findOne(id);
  }

  async remove(id: number, userId: number) {
    const positionConfiguration = await this.findOne(id);

    positionConfiguration.deletedBy = { id: userId } as User;
    await this.positionConfigurationsRepository.save(positionConfiguration);
    await this.positionConfigurationsRepository.softDelete(id);

    return {
      message: `La configuración de puesto con ID ${id} ha sido eliminada.`,
    };
  }
}

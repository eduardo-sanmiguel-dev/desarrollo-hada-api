import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Brackets, Repository } from 'typeorm';

import { PositionConfiguration } from './entities/position-configuration.entity';
import { EmployeePosition } from '../employees/entities';
import { User } from '../users/entities/user.entity';
import {
  CreatePositionConfigurationDto,
  FindAllPositionConfigurationsDto,
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
    const { positionId, responseTimeInDays } = createPositionConfigurationDto;
    const position = await this.validatePosition(positionId);

    const positionConfiguration = this.positionConfigurationsRepository.create({
      responseTimeInDays,
      position,
      createdBy: { id: userId },
    });

    return this.positionConfigurationsRepository.save(positionConfiguration);
  }

  async findAll(query: FindAllPositionConfigurationsDto) {
    const rawPage = Number(query.page ?? 1);
    const rawLimit = Number(query.limit ?? 10);
    const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
    const limit = Number.isFinite(rawLimit) ? rawLimit : 10;
    const shouldPaginate = limit > 0;

    const search = query.search?.trim() ?? '';
    const sortField: 'id' | 'position' | 'responseTimeInDays' | 'createdAt' =
      query.sortField ?? 'id';
    const sortDirection =
      (query.sortDirection?.toUpperCase() as 'ASC' | 'DESC' | undefined) ??
      'DESC';

    const qb = this.positionConfigurationsRepository
      .createQueryBuilder('positionConfiguration')
      .leftJoinAndSelect('positionConfiguration.createdBy', 'createdBy')
      .leftJoinAndSelect('positionConfiguration.updatedBy', 'updatedBy')
      .leftJoinAndSelect('positionConfiguration.deletedBy', 'deletedBy')
      .leftJoinAndSelect('positionConfiguration.position', 'position');

    if (search) {
      qb.andWhere(
        new Brackets((where) => {
          where.where('CAST(positionConfiguration.id AS TEXT) ILIKE :search', {
            search: `%${search}%`,
          });
          where.orWhere('position.name ILIKE :search', {
            search: `%${search}%`,
          });
          where.orWhere(
            'CAST(positionConfiguration.responseTimeInDays AS TEXT) ILIKE :search',
            {
              search: `%${search}%`,
            },
          );
        }),
      );
    }

    const sortColumnByField: Record<
      'id' | 'position' | 'responseTimeInDays' | 'createdAt',
      string
    > = {
      id: 'positionConfiguration.id',
      position: 'position.name',
      responseTimeInDays: 'positionConfiguration.responseTimeInDays',
      createdAt: 'positionConfiguration.createdAt',
    };

    qb.orderBy(sortColumnByField[sortField], sortDirection);

    if (shouldPaginate) {
      qb.skip((page - 1) * limit).take(limit);
    }

    const [items, total] = await qb.getManyAndCount();

    const responseLimit = shouldPaginate ? limit : total;
    const totalPages = shouldPaginate
      ? Math.max(1, Math.ceil(total / Math.max(1, limit)))
      : 1;

    return {
      items,
      total,
      page: shouldPaginate ? page : 1,
      limit: responseLimit,
      totalPages,
    };
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
    const currentPositionConfiguration = await this.findOne(id);

    const { positionId, responseTimeInDays } = updatePositionConfigurationDto;
    const position = positionId
      ? await this.validatePosition(positionId)
      : currentPositionConfiguration.position;

    await this.positionConfigurationsRepository.update(id, {
      responseTimeInDays:
        responseTimeInDays ?? currentPositionConfiguration.responseTimeInDays,
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

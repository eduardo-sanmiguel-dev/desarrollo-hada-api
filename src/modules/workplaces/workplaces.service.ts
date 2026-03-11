import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { CreateWorkplaceDto, UpdateWorkplaceDto } from './dto';
import { Workplace } from './entities/workplace.entity';

@Injectable()
export class WorkplacesService {
  private readonly logger = new Logger(WorkplacesService.name);
  private readonly relations = ['createdBy', 'updatedBy', 'deletedBy'];

  constructor(
    @InjectRepository(Workplace)
    private readonly workplacesRepository: Repository<Workplace>,
  ) {}

  create(createWorkplaceDto: CreateWorkplaceDto) {
    return createWorkplaceDto;
  }

  findAll() {
    return this.workplacesRepository.find({
      relations: this.relations,
      order: { name: 'ASC' },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} workplace`;
  }

  update(id: number, updateWorkplaceDto: UpdateWorkplaceDto) {
    return { id, updateWorkplaceDto };
  }

  remove(id: number) {
    return `This action removes a #${id} workplace`;
  }
}

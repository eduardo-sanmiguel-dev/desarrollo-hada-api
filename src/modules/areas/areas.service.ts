import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { CreateAreaDto, UpdateAreaDto } from './dto';
import { Area } from './entities/area.entity';

@Injectable()
export class AreasService {
  private readonly logger = new Logger(AreasService.name);
  private readonly relations = ['createdBy', 'updatedBy', 'deletedBy'];

  constructor(
    @InjectRepository(Area)
    private readonly areasRepository: Repository<Area>,
  ) {}

  create(createAreaDto: CreateAreaDto) {
    return createAreaDto;
  }

  async findAll() {
    const areas = await this.areasRepository.find({
      relations: this.relations,
      order: { name: 'ASC' },
    });

    return areas;
  }

  findOne(id: number) {
    return `This action returns a #${id} area`;
  }

  update(id: number, updateAreaDto: UpdateAreaDto) {
    return { id, updateAreaDto };
  }

  remove(id: number) {
    return `This action removes a #${id} area`;
  }
}

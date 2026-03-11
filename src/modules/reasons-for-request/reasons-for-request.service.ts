import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { CreateReasonsForRequestDto, UpdateReasonsForRequestDto } from './dto';
import { ReasonForRequest } from './entities/reasons-for-request.entity';

@Injectable()
export class ReasonsForRequestService {
  private readonly logger = new Logger(ReasonsForRequestService.name);
  private readonly relations = ['createdBy', 'updatedBy', 'deletedBy'];

  constructor(
    @InjectRepository(ReasonForRequest)
    private readonly reasonsForRequestRepository: Repository<ReasonForRequest>,
  ) {}

  create(createReasonsForRequestDto: CreateReasonsForRequestDto) {
    return createReasonsForRequestDto;
  }

  findAll() {
    return this.reasonsForRequestRepository.find({
      relations: this.relations,
      order: { name: 'ASC' },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} reasonsForRequest`;
  }

  update(id: number, updateReasonsForRequestDto: UpdateReasonsForRequestDto) {
    return { id, updateReasonsForRequestDto };
  }

  remove(id: number) {
    return `This action removes a #${id} reasonsForRequest`;
  }
}

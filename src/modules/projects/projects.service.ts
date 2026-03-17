import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';

import { Repository } from 'typeorm';

import { CreateProjectDto, UpdateProjectDto } from './dto';
import { Project } from './entities/project.entity';

@Injectable()
export class ProjectsService {
  private readonly relations = ['createdBy', 'updatedBy', 'deletedBy'];

  constructor(
    @InjectRepository(Project)
    private readonly projectsRepository: Repository<Project>,
  ) {}

  create(createProjectDto: CreateProjectDto) {
    return createProjectDto;
  }

  findAll() {
    return this.projectsRepository.find({ relations: this.relations });
  }

  async findOne(id: number) {
    return this.projectsRepository.findOne({
      where: { id },
      relations: this.relations,
    });
  }

  update(id: number, updateProjectDto: UpdateProjectDto) {
    return { id, updateProjectDto };
  }

  remove(id: number) {
    return `This action removes a #${id} project`;
  }
}

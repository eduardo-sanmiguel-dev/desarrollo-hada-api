import { Injectable } from '@nestjs/common';

import { CreateProjectDto, UpdateProjectDto } from './dto';

@Injectable()
export class ProjectsService {
  create(createProjectDto: CreateProjectDto) {
    return createProjectDto;
  }

  findAll() {
    return `This action returns all projects`;
  }

  findOne(id: number) {
    return `This action returns a #${id} project`;
  }

  update(id: number, updateProjectDto: UpdateProjectDto) {
    return { id, updateProjectDto };
  }

  remove(id: number) {
    return `This action removes a #${id} project`;
  }
}

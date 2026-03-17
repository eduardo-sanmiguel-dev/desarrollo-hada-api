import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { PersonnelRequisition } from './entities/personnel-requisition.entity';
import { Project } from '../projects/entities/project.entity';
import { User } from '../users/entities/user.entity';
import { Employee } from '../employees/entities';
import {
  CreatePersonnelRequisitionDto,
  UpdatePersonnelRequisitionDto,
} from './dto';

@Injectable()
export class PersonnelRequisitionsService {
  private readonly relations = [
    'authorizedBy',
    'createdBy',
    'updatedBy',
    'deletedBy',
    'area',
    'workplace',
    'positionRequired',
    'reasonForRequest',
    'usersRemplaced',
    'projectReplaced',
  ];

  constructor(
    @InjectRepository(PersonnelRequisition)
    private readonly personnelRequisitionsRepository: Repository<PersonnelRequisition>,
    @InjectRepository(Project)
    private readonly projectsRepository: Repository<Project>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Employee)
    private readonly employeesRepository: Repository<Employee>,
  ) {}

  async create(
    createPersonnelRequisitionDto: CreatePersonnelRequisitionDto,
    userId: number,
  ) {
    const currentUser = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!currentUser) {
      throw new NotFoundException(
        `Usuario solicitante con id ${userId} no encontrado`,
      );
    }

    const employeeRequestingUser = await this.employeesRepository.findOne({
      where: { code: currentUser.code },
      relations: ['position'],
    });

    if (!employeeRequestingUser) {
      throw new NotFoundException(
        `Empleado solicitante con código ${currentUser.code} no encontrado`,
      );
    }

    const {
      areaId,
      workplaceId,
      positionRequiredId,
      numberOfVacancies,
      isExternal,
      reasonForRequestId,
      usersRemplaced = [],
      projectReplacedName,
      observations,
    } = createPersonnelRequisitionDto;

    let projectId = 0;

    const projectReplacedNameCleaned = projectReplacedName
      ?.trim()
      .toLocaleLowerCase();

    if (projectReplacedName) {
      const existingProject = await this.projectsRepository.findOne({
        where: { name: projectReplacedNameCleaned },
      });

      projectId = existingProject?.id ?? 0;

      if (!existingProject) {
        const newProject = this.projectsRepository.create({
          name: projectReplacedNameCleaned,
        });
        projectId = (await this.projectsRepository.save(newProject)).id;
      }
    }

    const personnelRequisition = this.personnelRequisitionsRepository.create({
      requestDate: new Date(),
      area: { id: areaId },
      workplace: { id: workplaceId },
      positionRequired: { id: positionRequiredId },
      numberOfVacancies,
      isExternal,
      reasonForRequest: { id: reasonForRequestId },
      ...(usersRemplaced.length && {
        usersRemplaced: usersRemplaced.map((userId) => ({ id: userId })),
      }),
      ...(projectId ? { projectReplaced: { id: projectId } } : {}),
      observations,
      createdBy: { id: userId },
      positionRequestingUser: {
        id: employeeRequestingUser.position.id,
      },
    });

    const row =
      await this.personnelRequisitionsRepository.save(personnelRequisition);

    return this.findOne(row.id);
  }

  findAll() {
    return this.personnelRequisitionsRepository.find({
      relations: this.relations,
    });
  }

  async findOne(id: number) {
    const personnelRequisition =
      await this.personnelRequisitionsRepository.findOne({
        where: { id },
        relations: this.relations,
      });

    if (!personnelRequisition) {
      throw new NotFoundException(
        `Solicitud de personal con id ${id} no encontrada`,
      );
    }

    return personnelRequisition;
  }

  async update(
    id: number,
    updatePersonnelRequisitionDto: UpdatePersonnelRequisitionDto,
    userId: number,
  ) {
    const personnelRequisition = await this.findOne(id);

    Object.assign(personnelRequisition, {
      ...updatePersonnelRequisitionDto,
      updatedBy: { id: userId },
    });

    await this.personnelRequisitionsRepository.save(personnelRequisition);

    return this.findOne(id);
  }

  async remove(id: number, userId: number) {
    await this.findOne(id);

    await this.personnelRequisitionsRepository.softDelete({
      id,
      deletedBy: { id: userId },
    });

    return { message: `Solicitud de personal con id ${id} eliminada` };
  }
}

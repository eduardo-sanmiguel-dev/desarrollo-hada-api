import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Brackets, Repository } from 'typeorm';

import { PersonnelRequisition } from './entities/personnel-requisition.entity';
import { Project } from '../projects/entities/project.entity';
import { User } from '../users/entities/user.entity';
import { Employee } from '../employees/entities';
import { FindAllPersonnelRequisitionsDto } from './dto/find-all-personnel-requisitions.dto';
import {
  CreatePersonnelRequisitionDto,
  UpdatePersonnelRequisitionDto,
} from './dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class PersonnelRequisitionsService {
  private readonly relations = [
    'authorizedBy',
    'createdBy',
    'updatedBy',
    'deletedBy',
    'requestingUser',
    'area',
    'workplace',
    'positionRequired',
    'positionRequired.config',
    'reasonForRequest',
    'usersRemplaced',
    'projectReplaced',
    'positionRequestingUser',
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
    private readonly mailService: MailService,
  ) {}

  async projectReplacedCreate(projectReplacedName: string | undefined) {
    let projectId = 0;

    if (!projectReplacedName) {
      return projectId;
    }

    const projectReplacedNameCleaned = projectReplacedName
      .trim()
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

    return projectId;
  }

  async findUserByPermissions(route: string, permission: string) {
    const users = await this.usersRepository
      .createQueryBuilder('user')
      .where(`user.permissions ->> :route ILIKE :permission`, {
        route,
        permission: `%${permission}%`,
      })
      .getMany();

    return users;
  }

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

    const projectId = await this.projectReplacedCreate(projectReplacedName);

    const personnelRequisition = this.personnelRequisitionsRepository.create({
      requestDate: new Date(),
      area: { id: areaId },
      requestingUser: { id: userId },
      workplace: { id: workplaceId },
      positionRequired: { id: positionRequiredId },
      reasonForRequest: { id: reasonForRequestId },
      positionRequestingUser: {
        id: employeeRequestingUser.position.id,
      },
      numberOfVacancies,
      isExternal,
      ...(usersRemplaced.length && {
        usersRemplaced: usersRemplaced.map((userId) => ({ id: userId })),
      }),
      ...(projectId ? { projectReplaced: { id: projectId } } : {}),
      observations,
      createdBy: { id: userId },
    });

    const row =
      await this.personnelRequisitionsRepository.save(personnelRequisition);

    const currentPersonnelRequisition = await this.findOne(row.id);

    const usersToNotify = await this.findUserByPermissions(
      '/requisicion-de-personal',
      'approve-request',
    );

    if (usersToNotify.length) {
      const emailsToNotify = usersToNotify.map((user) => user.email);

      // Enviar correo
      void this.mailService.personnelRequisitionCreate(
        emailsToNotify,
        currentPersonnelRequisition,
      );
    }

    return currentPersonnelRequisition;
  }

  async findAll(query: FindAllPersonnelRequisitionsDto) {
    const rawPage = Number(query.page ?? 1);
    const rawLimit = Number(query.limit ?? 10);
    const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
    const limit = Number.isFinite(rawLimit) ? rawLimit : 10;
    const shouldPaginate = limit > 0;

    const search = query.search?.trim() ?? '';
    const sortField:
      | 'id'
      | 'requestDate'
      | 'createdAt'
      | 'numberOfVacancies'
      | 'isExternal'
      | 'reasonForRequest'
      | 'area'
      | 'requestingUser'
      | 'positionRequestingUser'
      | 'workplace'
      | 'positionRequired' = query.sortField ?? 'id';
    const sortDirection =
      (query.sortDirection?.toUpperCase() as 'ASC' | 'DESC' | undefined) ??
      'DESC';

    const qb = this.personnelRequisitionsRepository
      .createQueryBuilder('requisition')
      .leftJoinAndSelect('requisition.authorizedBy', 'authorizedBy')
      .leftJoinAndSelect('requisition.createdBy', 'createdBy')
      .leftJoinAndSelect('requisition.updatedBy', 'updatedBy')
      .leftJoinAndSelect('requisition.deletedBy', 'deletedBy')
      .leftJoinAndSelect('requisition.area', 'area')
      .leftJoinAndSelect('requisition.workplace', 'workplace')
      .leftJoinAndSelect('requisition.positionRequired', 'positionRequired')
      .leftJoinAndSelect('positionRequired.config', 'positionRequiredConfig')
      .leftJoinAndSelect('requisition.reasonForRequest', 'reasonForRequest')
      .leftJoinAndSelect('requisition.usersRemplaced', 'usersRemplaced')
      .leftJoinAndSelect('requisition.projectReplaced', 'projectReplaced')
      .leftJoinAndSelect('requisition.requestingUser', 'requestingUser')
      .leftJoinAndSelect(
        'requisition.positionRequestingUser',
        'positionRequestingUser',
      );

    if (search) {
      qb.andWhere(
        new Brackets((where) => {
          where.where('CAST(requisition.id AS TEXT) ILIKE :search', {
            search: `%${search}%`,
          });
          where.orWhere('area.name ILIKE :search', { search: `%${search}%` });
          where.orWhere('workplace.name ILIKE :search', {
            search: `%${search}%`,
          });
          where.orWhere('positionRequired.name ILIKE :search', {
            search: `%${search}%`,
          });
          where.orWhere('reasonForRequest.name ILIKE :search', {
            search: `%${search}%`,
          });
          where.orWhere(
            'CAST(requisition.numberOfVacancies AS TEXT) ILIKE :search',
            {
              search: `%${search}%`,
            },
          );
          where.orWhere(
            `CASE WHEN requisition.isExternal THEN 'externa' ELSE 'interna' END ILIKE :search`,
            { search: `%${search}%` },
          );
          where.orWhere('requestingUser.name ILIKE :search', {
            search: `%${search}%`,
          });
          where.orWhere('positionRequestingUser.name ILIKE :search', {
            search: `%${search}%`,
          });
        }),
      );
    }

    const sortColumnByField: Record<
      | 'id'
      | 'requestDate'
      | 'createdAt'
      | 'numberOfVacancies'
      | 'isExternal'
      | 'reasonForRequest'
      | 'area'
      | 'requestingUser'
      | 'positionRequestingUser'
      | 'workplace'
      | 'positionRequired',
      string
    > = {
      id: 'requisition.id',
      requestDate: 'requisition.requestDate',
      createdAt: 'requisition.createdAt',
      numberOfVacancies: 'requisition.numberOfVacancies',
      isExternal: 'requisition.isExternal',
      reasonForRequest: 'reasonForRequest.name',
      area: 'area.name',
      requestingUser: 'requestingUser.name',
      positionRequestingUser: 'positionRequestingUser.name',
      workplace: 'workplace.name',
      positionRequired: 'positionRequired.name',
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

    const {
      areaId,
      workplaceId,
      positionRequiredId,
      reasonForRequestId,
      numberOfVacancies,
      isExternal,
      observations,
      projectReplacedName,
      usersRemplaced,
    } = updatePersonnelRequisitionDto;

    const projectId = await this.projectReplacedCreate(projectReplacedName);

    await this.personnelRequisitionsRepository.update(
      id,
      Object.assign(personnelRequisition, {
        numberOfVacancies,
        area: { id: areaId },
        requestingUser: { id: userId },
        workplace: { id: workplaceId },
        positionRequired: { id: positionRequiredId },
        reasonForRequest: { id: reasonForRequestId },
        updatedBy: { id: userId },
        updatedAt: new Date(),
        isExternal,
        observations,
        ...(projectId ? { projectReplaced: { id: projectId } } : {}),
        ...(usersRemplaced && {
          usersRemplaced: usersRemplaced.map((userId) => ({ id: userId })),
        }),
      }),
    );

    return this.findOne(id);
  }

  async authorizeRequest(requisitionId: number, userId: number) {
    const personnelRequisition = await this.findOne(requisitionId);

    personnelRequisition.authorizedBy = { id: userId } as User;
    personnelRequisition.isAuthorized = true;
    personnelRequisition.authorizedDate = new Date();
    personnelRequisition.updatedBy = { id: userId } as User;
    personnelRequisition.updatedAt = new Date();

    await this.personnelRequisitionsRepository.save(personnelRequisition);

    const currentPersonnelRequisition = await this.findOne(requisitionId);

    const usersToNotify = await this.findUserByPermissions(
      '/requisicion-de-personal',
      'recruiter',
    );

    if (usersToNotify.length) {
      const emailsToNotify = usersToNotify.map((user) => user.email);

      // Enviar correo
      void this.mailService.personnelRequisitionAuthorized(
        emailsToNotify,
        currentPersonnelRequisition,
      );
    }

    return {
      message: `Solicitud de personal con id ${requisitionId} autorizada`,
    };
  }

  async remove(id: number, userId: number) {
    const personnelRequisition = await this.findOne(id);

    personnelRequisition.deletedBy = { id: userId } as User;
    await this.personnelRequisitionsRepository.save(personnelRequisition);
    await this.personnelRequisitionsRepository.softDelete(id);

    return { message: `Solicitud de personal con id ${id} eliminada` };
  }
}

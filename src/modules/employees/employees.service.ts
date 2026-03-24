import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Employee, EmployeeGenre, EmployeePosition } from './entities';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto';
import { PersonnelRequisition } from '../personnel-requisitions/entities/personnel-requisition.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class EmployeesService {
  private readonly logger = new Logger(EmployeesService.name);
  private readonly relationsAudits = ['createdBy', 'updatedBy', 'deletedBy'];
  private readonly relations = [
    ...this.relationsAudits,
    'area',
    'position',
    'gender',
    'personnelRequisition',
  ];

  constructor(
    @InjectRepository(Employee)
    private readonly employeesRepository: Repository<Employee>,
    @InjectRepository(EmployeePosition)
    private readonly employeePositionsRepository: Repository<EmployeePosition>,
    @InjectRepository(EmployeeGenre)
    private readonly employeeGenresRepository: Repository<EmployeeGenre>,
    @InjectRepository(PersonnelRequisition)
    private readonly personnelRequisitionsRepository: Repository<PersonnelRequisition>,
  ) {}

  private calculatePercentageOfCompliance(
    replacedUsers: number,
    vacancies: number,
  ): number {
    if (vacancies <= 0) {
      return 0;
    }

    return Math.min(100, Math.round((replacedUsers / vacancies) * 100));
  }

  private async refreshComplianceForRequisition(
    requisitionId: number,
  ): Promise<void> {
    const requisition = await this.personnelRequisitionsRepository.findOne({
      where: { id: requisitionId },
      select: ['id', 'numberOfVacancies'],
    });

    if (!requisition) {
      return;
    }

    const replacedUsersCount = await this.employeesRepository.count({
      where: { personnelRequisition: { id: requisitionId } },
    });

    const percentage = this.calculatePercentageOfCompliance(
      replacedUsersCount,
      requisition.numberOfVacancies,
    );

    await this.personnelRequisitionsRepository.update(requisitionId, {
      percentageOfCompliance: percentage,
    });
  }

  async create(createEmployeeDto: CreateEmployeeDto, userId: number) {
    const {
      code,
      name,
      birthdate,
      dateOfAdmission,
      areaId,
      positionId,
      genderId,
      personnelRequisitionId,
    } = createEmployeeDto;

    const employee = this.employeesRepository.create({
      code,
      name,
      birthdate,
      dateOfAdmission,
      area: { id: areaId },
      position: { id: positionId },
      gender: { id: genderId },
      ...(personnelRequisitionId
        ? { personnelRequisition: { id: personnelRequisitionId } }
        : {}),
      createdBy: { id: userId },
    });

    const createdEmployee = await this.employeesRepository.save(employee);

    if (personnelRequisitionId) {
      await this.refreshComplianceForRequisition(personnelRequisitionId);
    }

    return createdEmployee;
  }

  findAll() {
    return this.employeesRepository.find({
      relations: this.relations,
      order: { name: 'ASC' },
    });
  }

  findAllGenders() {
    return this.employeeGenresRepository.find({
      relations: this.relationsAudits,
      order: { name: 'ASC' },
    });
  }

  findAllPositions(withoutConfiguration = false) {
    const qb = this.employeePositionsRepository
      .createQueryBuilder('position')
      .leftJoin('position.config', 'positionConfiguration')
      .orderBy('position.name', 'ASC');

    if (withoutConfiguration) {
      qb.andWhere('positionConfiguration.id IS NULL');
    }

    return qb.getMany();
  }

  async findOne(id: number) {
    const employee = await this.employeesRepository.findOne({
      where: { id },
      relations: this.relations,
    });

    if (!employee) {
      throw new NotFoundException(`Colaborador con ID ${id} no encontrado.`);
    }

    return employee;
  }

  async update(
    id: number,
    updateEmployeeDto: UpdateEmployeeDto,
    userId: number,
  ) {
    const employee = await this.findOne(id);
    const previousRequisitionId = employee.personnelRequisition?.id;

    const {
      code,
      name,
      birthdate,
      dateOfAdmission,
      areaId,
      positionId,
      genderId,
      personnelRequisitionId,
    } = updateEmployeeDto;

    await this.employeesRepository.update(
      id,
      Object.assign(employee, {
        code,
        name,
        birthdate,
        dateOfAdmission,
        area: { id: areaId },
        position: { id: positionId },
        gender: { id: genderId },
        ...(personnelRequisitionId
          ? { personnelRequisition: { id: personnelRequisitionId } }
          : {}),
        updatedBy: { id: userId },
      }),
    );

    const currentRequisitionId =
      personnelRequisitionId ?? previousRequisitionId;

    if (currentRequisitionId) {
      await this.refreshComplianceForRequisition(currentRequisitionId);
    }

    if (
      previousRequisitionId &&
      previousRequisitionId !== currentRequisitionId
    ) {
      await this.refreshComplianceForRequisition(previousRequisitionId);
    }

    return this.findOne(id);
  }

  async remove(id: number, userId: number) {
    const employee = await this.findOne(id);

    employee.deletedBy = { id: userId } as User;
    await this.employeesRepository.save(employee);
    await this.employeesRepository.softDelete(id);

    return { message: `Colaborador con ID ${id} eliminado.` };
  }
}

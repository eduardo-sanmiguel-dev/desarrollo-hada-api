import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Employee, EmployeeGenre, EmployeePosition } from './entities';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto';
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
  ) {}

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

    return this.employeesRepository.save(employee);
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

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { CreateEmployeeDto, UpdateEmployeeDto } from './dto';
import { Employee, EmployeePosition } from './entities';

@Injectable()
export class EmployeesService {
  private readonly logger = new Logger(EmployeesService.name);
  private readonly relations = ['createdBy', 'updatedBy', 'deletedBy'];

  constructor(
    @InjectRepository(Employee)
    private readonly employeesRepository: Repository<Employee>,
    @InjectRepository(EmployeePosition)
    private readonly employeePositionsRepository: Repository<EmployeePosition>,
  ) {}

  create(createEmployeeDto: CreateEmployeeDto) {
    return createEmployeeDto;
  }

  findAll() {
    return this.employeesRepository.find({
      relations: this.relations,
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

  findOne(id: number) {
    return `This action returns a #${id} employee`;
  }

  update(id: number, updateEmployeeDto: UpdateEmployeeDto) {
    return { id, updateEmployeeDto };
  }

  remove(id: number) {
    return `This action removes a #${id} employee`;
  }
}

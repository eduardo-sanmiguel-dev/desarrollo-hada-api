import { Injectable } from '@nestjs/common';

import {
  CreatePersonnelRequisitionDto,
  UpdatePersonnelRequisitionDto,
} from './dto';

@Injectable()
export class PersonnelRequisitionsService {
  create(createPersonnelRequisitionDto: CreatePersonnelRequisitionDto) {
    return createPersonnelRequisitionDto;
  }

  findAll() {
    return `This action returns all personnelRequisitions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} personnelRequisition`;
  }

  update(
    id: number,
    updatePersonnelRequisitionDto: UpdatePersonnelRequisitionDto,
  ) {
    return { id, updatePersonnelRequisitionDto };
  }

  remove(id: number) {
    return `This action removes a #${id} personnelRequisition`;
  }
}

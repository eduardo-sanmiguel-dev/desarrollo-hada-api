import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';

import {
  CreatePersonnelRequisitionDto,
  UpdatePersonnelRequisitionDto,
} from './dto';
import { PersonnelRequisitionsService } from './personnel-requisitions.service';

@Controller('personnel-requisitions')
export class PersonnelRequisitionsController {
  constructor(
    private readonly personnelRequisitionsService: PersonnelRequisitionsService,
  ) {}

  @Post()
  create(@Body() createPersonnelRequisitionDto: CreatePersonnelRequisitionDto) {
    return this.personnelRequisitionsService.create(
      createPersonnelRequisitionDto,
    );
  }

  @Get()
  findAll() {
    return this.personnelRequisitionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.personnelRequisitionsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePersonnelRequisitionDto: UpdatePersonnelRequisitionDto,
  ) {
    return this.personnelRequisitionsService.update(
      +id,
      updatePersonnelRequisitionDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.personnelRequisitionsService.remove(+id);
  }
}

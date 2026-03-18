import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';

import { PersonnelRequisitionsService } from './personnel-requisitions.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import {
  CreatePersonnelRequisitionDto,
  FindAllPersonnelRequisitionsDto,
  UpdatePersonnelRequisitionDto,
} from './dto';

@Controller('personnel-requisitions')
export class PersonnelRequisitionsController {
  constructor(
    private readonly personnelRequisitionsService: PersonnelRequisitionsService,
  ) {}

  @Post()
  create(
    @Body() createPersonnelRequisitionDto: CreatePersonnelRequisitionDto,
    @CurrentUser() userId: number,
  ) {
    return this.personnelRequisitionsService.create(
      createPersonnelRequisitionDto,
      userId,
    );
  }

  @Get()
  findAll(@Query() query: FindAllPersonnelRequisitionsDto) {
    return this.personnelRequisitionsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.personnelRequisitionsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePersonnelRequisitionDto: UpdatePersonnelRequisitionDto,
    @CurrentUser() userId: number,
  ) {
    return this.personnelRequisitionsService.update(
      +id,
      updatePersonnelRequisitionDto,
      userId,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() userId: number) {
    return this.personnelRequisitionsService.remove(+id, userId);
  }
}

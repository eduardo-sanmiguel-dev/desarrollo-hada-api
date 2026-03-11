import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';

import { CreateWorkplaceDto, UpdateWorkplaceDto } from './dto';
import { WorkplacesService } from './workplaces.service';

@Controller('workplaces')
export class WorkplacesController {
  constructor(private readonly workplacesService: WorkplacesService) {}

  @Post()
  create(@Body() createWorkplaceDto: CreateWorkplaceDto) {
    return this.workplacesService.create(createWorkplaceDto);
  }

  @Get()
  findAll() {
    return this.workplacesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workplacesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateWorkplaceDto: UpdateWorkplaceDto,
  ) {
    return this.workplacesService.update(+id, updateWorkplaceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.workplacesService.remove(+id);
  }
}

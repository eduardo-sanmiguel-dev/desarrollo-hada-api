import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';

import { CreateReasonsForRequestDto, UpdateReasonsForRequestDto } from './dto';
import { ReasonsForRequestService } from './reasons-for-request.service';

@Controller('reasons-for-request')
export class ReasonsForRequestController {
  constructor(
    private readonly reasonsForRequestService: ReasonsForRequestService,
  ) {}

  @Post()
  create(@Body() createReasonsForRequestDto: CreateReasonsForRequestDto) {
    return this.reasonsForRequestService.create(createReasonsForRequestDto);
  }

  @Get()
  findAll() {
    return this.reasonsForRequestService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reasonsForRequestService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateReasonsForRequestDto: UpdateReasonsForRequestDto,
  ) {
    return this.reasonsForRequestService.update(
      +id,
      updateReasonsForRequestDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reasonsForRequestService.remove(+id);
  }
}

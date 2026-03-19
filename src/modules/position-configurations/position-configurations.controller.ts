import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';

import { PositionConfigurationsService } from './position-configurations.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import {
  CreatePositionConfigurationDto,
  UpdatePositionConfigurationDto,
} from './dto';

@Controller('position-configurations')
export class PositionConfigurationsController {
  constructor(
    private readonly positionConfigurationsService: PositionConfigurationsService,
  ) {}

  @Post()
  create(
    @Body() createPositionConfigurationDto: CreatePositionConfigurationDto,
    @CurrentUser() userId: number,
  ) {
    return this.positionConfigurationsService.create(
      createPositionConfigurationDto,
      userId,
    );
  }

  @Get()
  findAll() {
    return this.positionConfigurationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.positionConfigurationsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePositionConfigurationDto: UpdatePositionConfigurationDto,
    @CurrentUser() userId: number,
  ) {
    return this.positionConfigurationsService.update(
      +id,
      updatePositionConfigurationDto,
      userId,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() userId: number) {
    return this.positionConfigurationsService.remove(+id, userId);
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';

import { CreateUserDto, UpdateUserDto } from './dto';
import { UsersService } from './users.service';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto, @CurrentUser() userId: number) {
    return this.usersService.create(createUserDto, userId);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get('counts')
  countUsersByDatabase() {
    return this.usersService.countUsersByDatabase();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}

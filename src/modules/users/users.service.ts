import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';

import { DataSource, Repository } from 'typeorm';

import { CreateUserDto, UpdateUserDto } from './dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectDataSource('hallazgos')
    private readonly hallazgosDataSource: DataSource,
  ) {}

  create(createUserDto: CreateUserDto) {
    return createUserDto;
  }

  findAll() {
    return {
      message: 'This action returns all users',
      hallazgosDbConnected: this.hallazgosDataSource.isInitialized,
    };
  }

  async countUsersByDatabase() {
    const [primaryUsers, hallazgosUsers] = await Promise.all([
      this.usersRepository.count(),
      this.countUsersFromHallazgos(),
    ]);

    return {
      primaryUsers,
      hallazgosUsers,
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return { id, updateUserDto };
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  private async countUsersFromHallazgos(): Promise<number> {
    const result = await this.hallazgosDataSource.query<
      Array<{ total: number | string }>
    >('SELECT COUNT(*)::int AS total FROM users');

    const total = result[0]?.total ?? 0;

    return Number(total);
  }
}

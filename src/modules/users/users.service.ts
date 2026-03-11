import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { ConflictException, Injectable } from '@nestjs/common';
import argon2 from 'argon2';

import { DataSource, Repository } from 'typeorm';

import { CreateUserDto, UpdateUserDto } from './dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  private readonly relations = ['createdBy', 'updatedBy', 'deletedBy'];

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectDataSource('hallazgos')
    private readonly hallazgosDataSource: DataSource,
  ) {}

  async create(createUserDto: CreateUserDto, currentUserId: number) {
    const name = String(createUserDto.name).trim();
    const email = String(createUserDto.email).trim().toLowerCase();
    const plainPassword = String(createUserDto.password);

    const existingUser = await this.usersRepository.findOne({
      where: { email },
      withDeleted: true,
    });

    if (existingUser) {
      throw new ConflictException('Ya existe un usuario con ese correo');
    }

    const passwordHash = await argon2.hash(plainPassword, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 1,
    });

    const userToCreate = this.usersRepository.create({
      name,
      email,
      password: passwordHash,
      createdBy: {
        id: currentUserId,
      },
    });

    const createdUser = await this.usersRepository.save(userToCreate);

    return createdUser;
  }

  findAll() {
    return this.usersRepository.find({
      relations: this.relations,
      order: { name: 'ASC' },
    });
    /* return {
      message: 'This action returns all users',
      hallazgosDbConnected: this.hallazgosDataSource.isInitialized,
    }; */
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

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
    });
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

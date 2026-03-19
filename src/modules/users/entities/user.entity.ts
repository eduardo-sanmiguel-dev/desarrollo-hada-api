import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
} from 'typeorm';

export type UserPermissionValue =
  | string[]
  | UserPermissions
  | UserPermissions[];

export interface UserPermissions {
  [route: string]: UserPermissionValue;
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ length: 255, select: false })
  password: string;

  @Column({
    unique: true,
    type: 'bigint',
  })
  code: number;

  @Column('jsonb', { default: {} })
  permissions: UserPermissions;

  @Column({ default: 0, select: false })
  failedLoginAttempts: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @ManyToOne(() => User)
  createdBy: User;

  @ManyToOne(() => User)
  updatedBy: User;

  @ManyToOne(() => User)
  deletedBy?: User;
}

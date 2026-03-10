import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ length: 255 })
  password: string;

  @Column({ default: 0 })
  failedLoginAttempts: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @ManyToOne(() => User, { nullable: true })
  createdBy?: number;

  @ManyToOne(() => User, { nullable: true })
  updatedBy?: number;

  @ManyToOne(() => User, { nullable: true })
  deletedBy?: number;
}

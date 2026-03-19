import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToOne,
} from 'typeorm';

import { EmployeePosition } from 'src/modules/employees/entities';
import { User } from 'src/modules/users/entities/user.entity';

@Entity({
  name: 'position_configurations',
})
export class PositionConfiguration {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'int',
    transformer: {
      from: (value: number) => value,
      to: (value: number) => Math.floor(value),
    },
  })
  responseTime: number;

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

  @OneToOne(() => EmployeePosition)
  position: EmployeePosition;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
} from 'typeorm';

//import { Workplace } from 'src/modules/workplaces/entities/workplace.entity';
//import { Area } from 'src/modules/areas/entities/area.entity';

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

  /* @ManyToOne(() => Area, ({ createdBy }) => createdBy)
  createdByArea: Area;

  @ManyToOne(() => Area, ({ updatedBy }) => updatedBy)
  updatedByArea: Area;

  @ManyToOne(() => Area, ({ deletedBy }) => deletedBy)
  deletedByArea: Area;

  @ManyToOne(() => Workplace, ({ createdBy }) => createdBy)
  createdByWorkplace: Workplace;

  @ManyToOne(() => Workplace, ({ updatedBy }) => updatedBy)
  updatedByWorkplace: Workplace;

  @ManyToOne(() => Workplace, ({ deletedBy }) => deletedBy)
  deletedByWorkplace: Workplace; */
}

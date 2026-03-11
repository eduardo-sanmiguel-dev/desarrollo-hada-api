import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToOne,
} from 'typeorm';

import { ReasonForRequest } from 'src/modules/reasons-for-request/entities/reasons-for-request.entity';
import { Workplace } from 'src/modules/workplaces/entities/workplace.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Area } from 'src/modules/areas/entities/area.entity';

@Entity('personnel_requisitions')
export class PersonnelRequisition {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'date',
    transformer: {
      from: (value: string) => (value ? new Date(value) : null),
      to: (value: Date) => (value ? value.toISOString().slice(0, 10) : null),
    },
  })
  requestDate: Date;

  @Column()
  area: Area;

  @Column()
  requestingUser: User;

  @Column()
  workplace: Workplace;

  @Column()
  numberOfVacancies: number;

  @Column()
  isExternal: boolean;

  @Column()
  reasonForRequest: ReasonForRequest;

  @OneToOne(() => User, { nullable: true })
  userReplace?: User;

  @Column({ nullable: true })
  observations?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @ManyToOne(() => User)
  createdBy: User;

  @ManyToOne(() => User)
  updatedBy?: User;

  @ManyToOne(() => User)
  deletedBy?: User;
}

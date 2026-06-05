import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('nonconformance_reports')
export class NonconformanceReport {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  employeeId!: number;

  @Column({ type: 'text' })
  deviation!: string;

  @Column({ type: 'text' })
  nonconformance!: string;

  @Column({ type: 'text', nullable: true })
  signatureBase64?: string;

  @Column({ type: 'int' })
  reportedBy!: number;

  @CreateDateColumn()
  createdAt!: Date;
}

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, VersionColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';

export enum AbsenceStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
}

@Entity()
export class AbsenceRequest {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // @ManyToOne(() => User)
    // @JoinColumn({ name: 'employeeId' })
    // employeeId: User;

    @Column('uuid')
    employeeId: string;

    @Column()
    startDate: Date;

    @Column()
    endDate: Date;

    @Column()
    reason: string;

    @Column({
        type: 'text',
        enum: AbsenceStatus,
        default: AbsenceStatus.PENDING
    })
    status: AbsenceStatus;

    @Column({
        type: 'text',
        default: () => 'CURRENT_TIMESTAMP',
    })
    createdAt: string;

    @VersionColumn()
    version: number;
}

import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum UserRole {
    EMPLOYEE = 'EMPLOYEE',
    ADMIN = 'ADMIN',
}

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    email: string;

    @Column({
        type: 'text',
        enum: UserRole,
    })
    role: UserRole;
}

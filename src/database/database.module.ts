import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../user/entities/user.entity';
import { AbsenceRequest } from '../absences/entities/absence.entity';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                type: 'sqlite',
                database: ':memory:', //  use db.sqlite if need file based storage.
                entities: [User, AbsenceRequest],
                synchronize: true
            }),
        }),
        TypeOrmModule.forFeature([User, AbsenceRequest]),
    ],
})
export class DatabaseModule { }

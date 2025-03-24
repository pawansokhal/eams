import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AbsenceRequest } from './entities/absence.entity';
import { AbsencesService } from './absences.service';
import { AbsencesController } from './absences.controller';
// import { UserModule } from '../users/user.module';

import { JwtAuthGuard } from '../auth/jwt.guards';
import { RolesGuard } from '../auth/roles.guard';
import { APP_GUARD } from '@nestjs/core';

@Module({
    imports: [TypeOrmModule.forFeature([AbsenceRequest])],
    providers: [
        AbsencesService,
    ],
    controllers: [AbsencesController],
})
export class AbsenceModule { }

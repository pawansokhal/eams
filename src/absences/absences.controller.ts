import { Controller, Post, Patch, Get, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AbsencesService } from './absences.service';
import { CreateAbsenceDto } from './dto/create-absence.dto';
import { AbsenceRequest } from './entities/absence.entity';
import { JwtAuthGuard } from '../auth/jwt.guards';
import { AuthGuard } from '@nestjs/passport';

@Controller('absences')
export class AbsencesController {
    constructor(private readonly absencesService: AbsencesService) { }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    findAll(
        @Request() req,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 2
    ): Promise<AbsenceRequest[]> {
        const userRole = req.user.role;
        const skip = (page - 1) * limit;
        const take = limit;
        if (userRole === 'ADMIN') {
            return this.absencesService.findAll(skip, take);  // Return all absences if user is admin
        } else {
            return this.absencesService.findByEmployeeId(req.user.userId, skip, take);  // Filter by employee's ID if user is employee
        }
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('EMPLOYEE')
    create(@Body() createAbsenceDto: CreateAbsenceDto, @Request() req) {
        return this.absencesService.create(createAbsenceDto, req.user.userId);
    }

    @Patch(':id/approve')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    approve(@Param('id') id: string) {
        return this.absencesService.approve(id);
    }

    @Patch(':id/reject')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    reject(@Param('id') id: string) {
        return this.absencesService.reject(id);
    }
}

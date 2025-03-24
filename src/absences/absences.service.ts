import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { AbsenceRequest } from './entities/absence.entity';
import { CreateAbsenceDto } from './dto/create-absence.dto';
import { AbsenceStatus } from './entities/absence.entity';
import * as moment from 'moment';

@Injectable()
export class AbsencesService {
    constructor(
        @InjectRepository(AbsenceRequest)
        private readonly absenceRepository: Repository<AbsenceRequest>,
    ) { }

    findAll(skip: number, take: number) {
        return this.absenceRepository.find({
            skip: skip,
            take: take,
        });
    }

    findByEmployeeId(employeeId: string, skip: number, take: number) {
        return this.absenceRepository.find({
            where: { employeeId: employeeId },
            skip: skip,
            take: take,
        });
    }

    async create(createAbsenceDto: CreateAbsenceDto, employeeId: string) {
        const { startDate, endDate } = createAbsenceDto;

        const normalizedStartDate = moment(startDate).startOf('day').toDate();
        const normalizedEndDate = moment(endDate).endOf('day').toDate();
        if (new Date(normalizedEndDate) <= new Date(normalizedStartDate)) {
            throw new BadRequestException('End date must be after the start date.');
        }

        const query = this.absenceRepository.createQueryBuilder('absence')
            .where('absence.employeeId = :employeeId', { employeeId })
            .andWhere(
                new Brackets(qb => {
                    qb.where('absence.startDate BETWEEN :startDate AND :endDate', { startDate: normalizedStartDate, endDate: normalizedEndDate })
                        .orWhere('absence.endDate BETWEEN :startDate AND :endDate', { startDate: normalizedStartDate, endDate: normalizedEndDate })
                        .orWhere('absence.startDate <= :endDate AND absence.endDate >= :startDate', { startDate: normalizedStartDate, endDate: normalizedEndDate });
                })
            );

        const existingRequest = await query.getOne();
        if (existingRequest) {
            throw new BadRequestException('An absence request already exists for the selected date range.');
        }
        const absenceRequest = this.absenceRepository.create({
            ...createAbsenceDto,
            employeeId,
            status: AbsenceStatus.PENDING,
        });
        return this.absenceRepository.save(absenceRequest);
    }

    async approve(id: string) {
        const queryRunner = this.absenceRepository.manager.connection.createQueryRunner();
        await queryRunner.startTransaction();

        try {
            // Fetch the absence request, including the version column
            const absenceRequest = await queryRunner.manager
                .getRepository(AbsenceRequest)
                .createQueryBuilder('absence')
                .where('absence.id = :id', { id })
                .getOne();

            if (!absenceRequest) {
                throw new BadRequestException('Absence request not found');
            }

            if (absenceRequest.status !== AbsenceStatus.PENDING) {
                throw new BadRequestException('The absence request has already been processed and cannot be modified.');
            }

            absenceRequest.status = AbsenceStatus.APPROVED;

            // Save the changes with optimistic locking.
            await queryRunner.manager.save(absenceRequest);
            await queryRunner.commitTransaction();
            return { message: 'Absence request approved' };

        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }



    async reject(id: string) {
        const queryRunner = this.absenceRepository.manager.connection.createQueryRunner();
        await queryRunner.startTransaction();

        try {
            // Fetch the absence request, including the version column
            const absenceRequest = await queryRunner.manager
                .getRepository(AbsenceRequest)
                .createQueryBuilder('absence')
                .where('absence.id = :id', { id })
                .getOne();

            if (!absenceRequest) {
                throw new BadRequestException('Absence request not found');
            }

            if (absenceRequest.status !== AbsenceStatus.PENDING) {
                throw new BadRequestException('The absence request has already been processed and cannot be modified.');
            }

            absenceRequest.status = AbsenceStatus.REJECTED;

            // Save the changes with optimistic locking.
            await queryRunner.manager.save(absenceRequest);
            await queryRunner.commitTransaction();
            return { message: 'Absence request rejected' };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }



}

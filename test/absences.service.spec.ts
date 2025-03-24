import { Test, TestingModule } from '@nestjs/testing';
import { AbsencesService } from '../src/absences/absences.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AbsenceRequest, AbsenceStatus } from '../src/absences/entities/absence.entity';
import { Repository } from 'typeorm';
import { BadRequestException } from '@nestjs/common';


const createAbsenceDto = {
    reason: 'Sick Leave',
    startDate: new Date('2025-03-01T00:00:00Z'),
    endDate: new Date('2025-03-02T00:00:00Z')
};

const mockAbsenceRequests = [
    {
        id: "f583f5ac-326c-4ef3-a960-0cc36e49b1b7",
        employeeId: "05e9a20e-cd21-4a20-a067-ceda329f6921",
        startDate: new Date("2025-03-23T00:00:00.000Z"),
        endDate: new Date("2025-03-24T00:00:00.000Z"),
        reason: "Medical Leave 4",
        status: AbsenceStatus.PENDING,
        createdAt: "2025-03-23T00:00:00.000Z",
        version: 1
    }
];

describe('AbsencesService', () => {
    let service: AbsencesService;
    let repository: Repository<AbsenceRequest>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AbsencesService,
                {
                    provide: getRepositoryToken(AbsenceRequest),
                    useClass: Repository,
                },
            ],
        }).compile();

        service = module.get<AbsencesService>(AbsencesService);
        repository = module.get<Repository<AbsenceRequest>>(getRepositoryToken(AbsenceRequest));
    });


    describe('findAll', () => {
        it('should return an array of absence requests', async () => {
            jest.spyOn(repository, 'find').mockResolvedValue(mockAbsenceRequests);
            expect(await service.findAll(0, 10)).toBe(mockAbsenceRequests);
        });
    });

    describe('findByEmployeeId', () => {
        it('should return an array of absence requests for a specific employee', async () => {
            jest.spyOn(repository, 'find').mockResolvedValue(mockAbsenceRequests);
            expect(await service.findByEmployeeId('employee1', 0, 10)).toBe(mockAbsenceRequests);
        });
    });

    describe('create', () => {
        it('should create and return a new absence request', async () => {
            const employeeId = 'employee1';
            const result = { ...createAbsenceDto, employeeId, status: AbsenceStatus.PENDING, id: '1' };

            jest.spyOn(repository, 'create').mockReturnValue(result as any);
            jest.spyOn(repository, 'save').mockResolvedValue(result as any);

            expect(await service.create(createAbsenceDto, employeeId)).toBe(result);
        });

        it('should throw an error if absence request creation fails', async () => {
            const employeeId = 'employee1';
            jest.spyOn(repository, 'create').mockImplementation(() => { throw new Error('Error creating request'); });

            try {
                await service.create(createAbsenceDto, employeeId);
            } catch (error) {
                expect(error.message).toBe('Error creating request');
            }
        });
    });
});
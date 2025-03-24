import { IsDateString, IsString } from 'class-validator';

export class CreateAbsenceDto {
    @IsDateString()
    startDate: Date;

    @IsDateString()
    endDate: Date;

    @IsString()
    reason: string;
}

import { IsString, IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
export enum UserRole {
    EMPLOYEE = 'EMPLOYEE',
    ADMIN = 'ADMIN',
}
export class RegisterDto {
    readonly id?: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsEnum(UserRole)
    role: UserRole;
}

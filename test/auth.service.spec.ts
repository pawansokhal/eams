import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../src/auth/auth.service';
import { UserService } from '../src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException } from '@nestjs/common';
import { RegisterDto } from '../src/auth/dto/register.dto';
import { JwtPayload } from '../src/auth/jwt.strategy';
import { UserRole } from '../src/user/entities/user.entity';


describe('AuthService', () => {
    let authService: AuthService;
    let userService: UserService;
    let jwtService: JwtService;

    // Mocked user data
    const mockUser = {
        id: '7fb9c18f-e527-4ab4-89f7-2fb9e1f98064',
        name: "Test User",
        email: 'test@example.com',
        role: 'EMPLOYEE',
    };

    const mockJwtPayload: JwtPayload = { sub: mockUser.id, role: mockUser.role };
    const mockAccessToken = 'mockAccessToken';

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UserService,
                    useValue: {
                        create: jest.fn().mockResolvedValue(mockUser),
                        findByEmail: jest.fn().mockResolvedValue(mockUser),
                    },
                },
                {
                    provide: JwtService,
                    useValue: {
                        sign: jest.fn().mockReturnValue(mockAccessToken),
                    },
                },
            ],
        }).compile();

        authService = module.get<AuthService>(AuthService);
        userService = module.get<UserService>(UserService);
        jwtService = module.get<JwtService>(JwtService);
    });

    describe('register', () => {
        it('should register a new user successfully', async () => {
            const registerDto: RegisterDto = {
                name: "Test User",
                email: 'test@example.com',
                role: UserRole.EMPLOYEE
            };

            const result = await authService.register(registerDto);
            expect(result).toEqual(mockUser);
            expect(userService.create).toHaveBeenCalledWith(registerDto);
        });
    });

    describe('login', () => {
        it('should return an access token when the user exists', async () => {
            const email = 'test@example.com';
            const result = await authService.login(email);

            expect(result).toEqual({ access_token: mockAccessToken });
            expect(userService.findByEmail).toHaveBeenCalledWith(email);
            expect(jwtService.sign).toHaveBeenCalledWith(mockJwtPayload);
        });

        it('should throw an error if the user is not found', async () => {
            const email = 'nonexistent@example.com';
            userService.findByEmail = jest.fn().mockResolvedValue(null);

            await expect(authService.login(email)).rejects.toThrow(BadRequestException);
            await expect(authService.login(email)).rejects.toThrow('User not found');
        });
    });
});

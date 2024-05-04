import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "../auth.service";
import { AuthController } from "../auth.controller";
import { PrismaService } from "../../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "../../user/user.service";
import { User } from "../../user/entities/user.entity";
import * as bcrypt from 'bcrypt'

describe('AuthController', () => {
    let service: AuthService;
    let userService: UserService;
    let jwtService: JwtService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [AuthService, PrismaService, JwtService, UserService]

        }).compile();

        service = module.get<AuthService>(AuthService);
        userService = module.get(UserService);
        jwtService = module.get(JwtService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    })

    describe('validateUser', () => {
        it('PU_06 should return user if username and password are valid', async () => {
            const username = 'testuser';
            const password = 'testpassword';
            const hashedPassword = await bcrypt.hash(password, 10);
            const user: User = {
                id: 1,
                username,
                password: hashedPassword,
                cellphone: '15423132',
                name: "testuser",
                roles: "[ADMIN]",
                update_at: new Date(),
                delete_at: null,
            };
            const mockedUserDto = { ...user };

            jest.spyOn(userService, 'getByUsername').mockResolvedValue(user);
            jest.spyOn(bcrypt, 'compare').mockResolvedValue(Promise.resolve(true) as never);
            jest.spyOn(userService, 'toDto').mockReturnValue(mockedUserDto);

            const result = await service.validateUser(username, password);

            expect(result).toEqual(user);
        });

        it('PU_07 should return null if user does not exist', async () => {
            const username = 'nonexistentuser';

            jest.spyOn(userService, 'getByUsername').mockResolvedValue(null);

            const result = await service.validateUser(username, 'anypassword');

            expect(result).toBeNull();
        });

        it('PU_08 should return null if password is invalid', async () => {
            const username = 'testuser';
            const password = 'invalidpassword';
            const user: User = {
                id: 1,
                username,
                password: 'validhashedpassword',
                cellphone: '15423132',
                name: "testuser",
                roles: "[ADMIN]",
                update_at: new Date(),
                delete_at: null,
            };

            jest.spyOn(userService, 'getByUsername').mockResolvedValue(user);
            jest.spyOn(bcrypt, 'compare').mockResolvedValue(Promise.resolve(false) as never);

            const result = await service.validateUser(username, password);

            expect(result).toBeNull();
        });
    });

    describe('generateJwtToken', () => {
        it('PU_09 should return a JWT token', async () => {
            const user: User = {
                id: 1,
                username: 'testuser',
                password: 'testpassword',
                cellphone: '15423132',
                name: "testuser",
                roles: "[ADMIN]",
                update_at: new Date(),
                delete_at: null,
            };
            const mockedUserDto = { ...user };
            const jwtToken = 'generatedJWTToken';

            jest.spyOn(userService, 'toDto').mockReturnValue(mockedUserDto);
            jest.spyOn(jwtService, 'signAsync').mockResolvedValue(jwtToken);

            const result = await service.generateJwtToken(user);

            expect(result).toBe(jwtToken);
        });

    });
});
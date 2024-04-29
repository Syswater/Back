import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { User } from '../../user/entities/user.entity';

describe('AuthController', () => {
    let controller: AuthController;
    let authService: AuthService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: {
                        validateUser: jest.fn(),
                        generateJwtToken: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get(AuthController);
        authService = module.get(AuthService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('login', () => {
        it('PU_10 should return token if credentials are valid', async () => {
            const credentials = { username: 'testuser', password: 'testpassword' };
            const user: User = {
                id: 1,
                username: 'testuser',
                password: 'hashedpassword',
                cellphone: '15423132',
                name: "testuser",
                roles: "[ADMIN]",
                update_at: new Date(),
                delete_at: null,
            };
            const token = 'generatedJwtToken';

            jest.spyOn(authService, 'validateUser').mockResolvedValue(user);
            jest.spyOn(authService, 'generateJwtToken').mockResolvedValue(token);

            const result = await controller.login(credentials);

            expect(result).toEqual({ token });
        });

        it('PU_11 should throw UnauthorizedException if credentials are invalid', async () => {
            const credentials = { username: 'invaliduser', password: 'invalidpassword' };

            jest.spyOn(authService, 'validateUser').mockResolvedValue(null);

            await expect(controller.login(credentials)).rejects.toThrow(UnauthorizedException);
        });
    });
});

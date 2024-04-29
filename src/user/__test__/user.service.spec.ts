import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user.service';
import { PrismaService } from '../../prisma/prisma.service';
import { User } from '../entities/user.entity';
import { Role } from '../../constants/role';


describe('UserService', () => {
    let service: UserService;
    let prismaService: PrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                {
                    provide: PrismaService,
                    useValue: {
                        user: {
                            findFirst: jest.fn(),
                        },
                    },
                },
            ],
        }).compile();

        service = module.get(UserService);
        prismaService = module.get(PrismaService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getRoles', () => {
        it('PU_01 should return an empty array if user has no roles', () => {
            const user: User = {
                id: 1,
                username: "testuser",
                password: 'validhashedpassword',
                cellphone: '15423132',
                name: "testuser",
                roles: "",
                update_at: new Date(),
                delete_at: null,
            };
            const roles = service.getroles(user);
            expect(roles).toEqual([]);
        });

        it('PU_02 should return valid roles from user', () => {
            const user: User = {
                id: 1,
                username: "testuser",
                password: 'validhashedpassword',
                cellphone: '15423132',
                name: "testuser",
                update_at: new Date(),
                delete_at: null,
                roles: "ADMIN, DISTRIBUTOR"
            };
            const roles = service.getroles(user);
            expect(roles).toEqual([Role.ADMIN, Role.DISTRIBUTOR]);
        });

        it('PU_03 should ignore invalid roles', () => {
            const user: User = {
                id: 1,
                username: "testuser",
                password: 'validhashedpassword',
                cellphone: '15423132',
                name: "testuser",
                update_at: new Date(),
                delete_at: null,
                roles: 'INVALID, ADMIN'
            };
            const roles = service.getroles(user);
            expect(roles).toEqual([Role.ADMIN]);
        });
    });

    describe('getByUsername', () => {
        it('PU_04 should return user by username', async () => {
            const username = 'testuser';
            const user: User = {
                id: 1,
                username,
                password: 'validhashedpassword',
                cellphone: '15423132',
                name: "testuser",
                update_at: new Date(),
                delete_at: null,
                roles: "ADMIN, DISTRIBUTOR"
            };
            const findFirstSpy = jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(user);
            const result = await service.getByUsername(username);
            expect(result).toEqual(user);
            expect(findFirstSpy).toHaveBeenCalledWith({ where: { username } });
        });
    });

    describe('toDto', () => {
        it('PU_05 should convert user entity to DTO', () => {
            const user: User = {
                id: 1,
                username: "testuser",
                password: 'validhashedpassword',
                cellphone: '123456789',
                name: "Test User",
                update_at: new Date(),
                delete_at: null,
                roles: "ADMIN, DISTRIBUTOR"
            };
            const expectedDto = {
                id: 1, name: 'Test User',
                cellphone: '123456789',
                username: 'testuser',
                roles: 'ADMIN, DISTRIBUTOR'
            };
            const result = service.toDto(user);
            expect(result).toEqual(expectedDto);
        });
    });
});

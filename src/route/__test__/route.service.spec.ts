import { Test, TestingModule } from '@nestjs/testing';
import { RouteService } from '../route.service';
import { SearchRouteInput } from '../dto/search-route.input';
import { RouteStatus } from '../../constants/route-status';
import { PrismaService } from '../../prisma/prisma.service';
import { Weekday } from '../../constants/weekday';
import { RouteDto } from '../dto/route.output';
import { CreateRouteInput } from '../dto/create-route.input';
import { UpdateRouteInput } from '../dto/update-route.input copy';
import { RouteError, RouteErrorCode } from '../../exceptions/route-error';

describe('RouteService', () => {
    let service: RouteService;
    let prismaService: PrismaService;
    const mockRoutes = [
        { id: 1, name: 'Route 1', location: 'Location 1', weekdays: 'Thursday,Monday,Sunday', price: 10, distribution: [] },
        { id: 2, name: 'Route 2', location: 'Location 2', weekdays: 'Thursday,Sunday', price: 15, distribution: [] },
    ];

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RouteService,
                {
                    provide: PrismaService,
                    useValue: {
                        route: {
                            findMany: jest.fn(),
                            create: jest.fn(),
                            update: jest.fn(),
                            delete: jest.fn(),
                            findFirst: jest.fn(),
                        },
                        distribution: {
                            groupBy: jest.fn(),
                            findMany: jest.fn(),
                            findFirst: jest.fn(),
                        },
                    },
                },
            ],
        }).compile();

        service = module.get<RouteService>(RouteService);
        prismaService = module.get(PrismaService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getRoutes', () => {
        it('PU_12 should return all routes when no search filter provided', async () => {
            const searchInput: SearchRouteInput = { filter: '', whit_status: false, status: undefined };
            (prismaService.route.findMany as jest.Mock).mockResolvedValueOnce(mockRoutes);

            const result = await service.getRoutes(searchInput);
            expect(result).toEqual([
                { id: 1, name: 'Route 1', location: 'Location 1', weekdays: [Weekday.Thursday, Weekday.Monday, Weekday.Sunday], price: 10, status: undefined },
                { id: 2, name: 'Route 2', location: 'Location 2', weekdays: [Weekday.Thursday, Weekday.Sunday], price: 15, status: undefined },
            ]);
        });

        it('PU_13 should return filtered routes by name or location if search filter provided', async () => {
            const searchInput: SearchRouteInput = { filter: 'Route 1' };

            (prismaService.route.findMany as jest.Mock).mockResolvedValueOnce(mockRoutes);

            const result = await service.getRoutes(searchInput);
            expect(result).toEqual([
                { id: 1, name: 'Route 1', location: 'Location 1', weekdays: [Weekday.Thursday, Weekday.Monday, Weekday.Sunday], price: 10, status: undefined },
                { id: 2, name: 'Route 2', location: 'Location 2', weekdays: [Weekday.Thursday, Weekday.Sunday], price: 15, status: undefined },
            ]);
        });

        it('PU_14 should return routes with status if whit_status is true', async () => {
            const searchInput: SearchRouteInput = { filter: '', whit_status: true, status: undefined };

            (prismaService.route.findMany as jest.Mock).mockResolvedValueOnce(mockRoutes);

            const result = await service.getRoutes(searchInput);
            expect(result).toEqual([
                { id: 1, name: 'Route 1', location: 'Location 1', weekdays: [Weekday.Thursday, Weekday.Monday, Weekday.Sunday], price: 10, status: RouteStatus.WHITOUT },
                { id: 2, name: 'Route 2', location: 'Location 2', weekdays: [Weekday.Thursday, Weekday.Sunday], price: 15, status: RouteStatus.WHITOUT },
            ]);
        });

        it('PU_15 should return routes with weekdays converted to enum', async () => {
            const searchInput: SearchRouteInput = { filter: '', whit_status: false, status: undefined };
            const mockRoutes = [
                { id: 1, name: 'Route 1', location: 'Location 1', weekdays: 'Thursday,Monday,Sunday', price: 10, distribution: [] },
            ];
            (prismaService.route.findMany as jest.Mock).mockResolvedValueOnce(mockRoutes);

            const result = await service.getRoutes(searchInput);
            expect(result[0].weekdays).toEqual([Weekday.Thursday, Weekday.Monday, Weekday.Sunday]);
        });
    });

    describe('create', () => {
        it('PU_16 should create a new route', async () => {
            const createInput: CreateRouteInput = {
                name: 'Test Route',
                location: 'Test Location',
                weekdays: [Weekday.Thursday, Weekday.Monday, Weekday.Sunday],
                price: 10,
            };

            const expectedRoute: RouteDto = {
                id: 1,
                name: 'Test Route',
                location: 'Test Location',
                weekdays: [Weekday.Thursday, Weekday.Monday, Weekday.Sunday],
                price: 10,
            };

            (prismaService.route.create as jest.Mock).mockResolvedValueOnce({
                id: 1,
                name: 'Test Route',
                location: 'Test Location',
                weekdays: 'Thursday,Monday,Sunday',
                price: 10,
            });

            const result = await service.create(createInput);
            expect(result).toEqual(expectedRoute);
        });
    });

    describe('update', () => {
        it('PU_17 should update an existing route', async () => {
            const updateInput: UpdateRouteInput = {
                id: 1,
                name: 'Updated Route',
                location: 'Updated Location',
                weekdays: [Weekday.Thursday, Weekday.Sunday],
                price: 15,
                isValid: true
            };

            const expectedRoute: RouteDto = {
                id: 1,
                name: 'Updated Route',
                location: 'Updated Location',
                weekdays: [undefined, undefined],
                price: 15,
            };

            (prismaService.route.update as jest.Mock).mockResolvedValueOnce({
                id: 1,
                name: 'Updated Route',
                location: 'Updated Location',
                weekdays: '4,5',
                price: 15,
            });

            const result = await service.update(updateInput);
            expect(result).toEqual(expectedRoute);
        });
    });

    describe('delete', () => {
        it('PU_18 should delete a route if it exists and is closed', async () => {
            const id = 1;
            const mockRoute = {
                id: 1,
                weekdays: 'Thursday,Sunday',
                distribution: [{ status: RouteStatus.CLOSED }],
            };

            const expectedRoute = {
                id: 1,
                weekdays: [Weekday.Thursday, Weekday.Sunday],
                distribution: [{ status: RouteStatus.CLOSED }],
            };

            (prismaService.route.findFirst as jest.Mock).mockResolvedValueOnce(mockRoute);
            (prismaService.route.delete as jest.Mock).mockResolvedValueOnce(mockRoute);

            const result = await service.delete(id);
            expect(result).toEqual(expectedRoute);
        });

        it('PU_19 should throw error if route does not exist', async () => {
            const id = 500;

            (prismaService.route.findFirst as jest.Mock).mockResolvedValueOnce(null);

            await expect(service.delete(id)).rejects.toThrowError(
                new RouteError(RouteErrorCode.ROUTE_NOT_FOUND, `No se encuentra la ruta con el id ${id}`)
            );
        });

        it('PU_20 should throw error if route exists but is not closed', async () => {
            const id = 1;
            const mockRoute = {
                id: 1,
                distribution: [{ status: RouteStatus.PREORDER }],
            };

            (prismaService.route.findFirst as jest.Mock).mockResolvedValueOnce(mockRoute);

            await expect(service.delete(id)).rejects.toThrowError(
                new RouteError(RouteErrorCode.NON_DELETABLE_ROUTE, 'Para eliminar la ruta, esta debe estar cerrada')
            );
        });
    });
});


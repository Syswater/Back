import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {

    constructor() {
        super({
            log: [
                {
                    emit: 'event',
                    level: 'query',
                },
                {
                    emit: 'stdout',
                    level: 'error',
                },
                {
                    emit: 'stdout',
                    level: 'info',
                },
                {
                    emit: 'stdout',
                    level: 'warn',
                },
            ],
            errorFormat: 'pretty',
        });
    }

    async enableShutdownHooks(app: INestApplication): Promise<void> {
        process.on('beforeExit', async () => {
            await this.$disconnect();
            app.close();
        });
    }

    async onModuleInit(): Promise<void> {
        await this.$connect();
    }
}

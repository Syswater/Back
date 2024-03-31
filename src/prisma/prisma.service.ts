import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    private count = 0;

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
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
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

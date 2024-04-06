import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { TriggerService } from './trigger/trigger.service';

@Module({
    providers: [PrismaService, TriggerService],
    exports: [PrismaService, TriggerService]
})
export class PrismaModule { }

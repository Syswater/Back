import { Module } from '@nestjs/common';
import { RouteService } from './route.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { RouteController } from './route.controller';
import { TriggersService } from './triggers/triggers.service';

@Module({
  providers: [RouteService, PrismaService, TriggersService],
  controllers: [RouteController]
})
export class RouteModule { }

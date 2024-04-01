import { Module } from '@nestjs/common';
import { RouteService } from './route.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { RouteController } from './route.controller';

@Module({
  providers: [RouteService, PrismaService],
  controllers: [RouteController]
})
export class RouteModule {}

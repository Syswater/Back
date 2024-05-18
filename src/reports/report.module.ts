import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';

@Module({
  providers: [PrismaService, ReportService],
  exports: [ReportService],
  controllers: [ReportController],
})
export class ReportModule {}

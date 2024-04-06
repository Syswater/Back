import { Module } from '@nestjs/common';
import { CustomerService } from './services/customer.service';
import { CustomerController } from './controllers/customer.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { NoteService } from './services/note.service';
import { TriggerService } from 'src/prisma/trigger/trigger.service';
import { NoteController } from './controllers/note.controller';

@Module({
  providers: [CustomerService, NoteService, PrismaService, TriggerService],
  controllers: [CustomerController, NoteController]
})
export class CustomerModule {}

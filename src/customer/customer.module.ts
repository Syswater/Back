import { Module } from '@nestjs/common';
import { CustomerService } from './services/customer.service';
import { CustomerController } from './controllers/customer.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { NoteService } from './services/note.service';
import { NoteController } from './controllers/note.controller';
import { TriggersService } from './triggers/triggers.service';

@Module({
  providers: [CustomerService, NoteService, PrismaService, TriggersService],
  controllers: [CustomerController, NoteController]
})
export class CustomerModule {}

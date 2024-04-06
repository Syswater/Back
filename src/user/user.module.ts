import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { TriggersService } from './triggers/triggers.service';

@Module({
  providers: [UserService, PrismaService, TriggersService],
  exports: [UserService]
})
export class UserModule { }

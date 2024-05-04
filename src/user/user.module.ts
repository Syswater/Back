import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { TriggersService } from './triggers/triggers.service';
import { UserController } from './user.controller';

@Module({
  providers: [UserService, PrismaService, TriggersService],
  exports: [UserService],
  controllers: [UserController]
})
export class UserModule { }

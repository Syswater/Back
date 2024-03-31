import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './auth/strategies/jwt.strategy';
import { UserModule } from './user/user.module';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';

@Module({
  imports: [AuthModule,
    JwtModule.register({
      secret: 'SySwAtEr_SeCrEt',
      signOptions: { expiresIn: '24h' },
    }),
    UserModule,
    PrismaModule,],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, JwtStrategy],
})
export class AppModule { }

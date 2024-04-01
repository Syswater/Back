import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './auth/strategies/jwt.strategy';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { RouteModule } from './route/route.module';

@Module({
  imports: [AuthModule,
    JwtModule.register({
      secret: process.env.SECRET,
      signOptions: { expiresIn: '24h' },
    }),
    UserModule,
    PrismaModule,
    RouteModule,],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AppModule { }

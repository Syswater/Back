import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './auth/strategies/jwt.strategy';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { RouteModule } from './route/route.module';
import { CustomerModule } from './customer/customer.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesAuthGuard } from './auth/guards/roles-auth.guard';
import { TriggerService } from './prisma/trigger/trigger.service';
import { OrderModule } from './order/order.module';
import { DistributionModule } from './distribution/distribution.module';

@Module({
  imports: [AuthModule,
    JwtModule.register({
      global: true,
      secret: process.env.SECRET,
      signOptions: { expiresIn: '24h' },
    }),
    UserModule,
    PrismaModule,
    RouteModule,
    CustomerModule,
    OrderModule,
    DistributionModule,],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AppModule { }

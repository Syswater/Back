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
import { OrderModule } from './order/order.module';
import { DistributionModule } from './distribution/distribution.module';
import { TransactionModule } from './transaction/transaction.module';
import { ReportModule } from './reports/report.module';

@Module({
  imports: [
    AuthModule,
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
    DistributionModule,
    TransactionModule,
    ReportModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AppModule {}

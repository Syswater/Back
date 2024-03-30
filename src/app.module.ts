import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './auth/strategies/jwt.strategy';
import { UserModule } from './user/user.module';

@Module({
  imports: [AuthModule,
    JwtModule.register({
      secret: 'SySwAtEr_SeCrEt',
      signOptions: { expiresIn: '24h' },
    }),
    UserModule,],
  controllers: [AppController],
  providers: [AppService, JwtStrategy],
})
export class AppModule { }

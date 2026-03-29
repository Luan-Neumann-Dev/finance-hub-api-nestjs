import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { Secret, SignOptions } from 'jsonwebtoken';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET as Secret,
        signOptions: {
          expiresIn: process.env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
        },
      }),
      global: true,
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}

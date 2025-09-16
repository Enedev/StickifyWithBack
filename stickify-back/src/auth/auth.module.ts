import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UsersService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [AuthController],
  providers: [AuthService, UsersService],
  imports:[
    JwtModule.register({
      global:true,
      secret: 'AABBCC',
      signOptions: { expiresIn: '1h' }
    }),
    TypeOrmModule.forFeature([User])
  ]
})
export class AuthModule {}
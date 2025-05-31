import { Injectable, NotFoundException } from '@nestjs/common';
import { SignUpDto } from './dto/sign-up.dto';
import { LoginDto } from './dto/login.dto';
import { LoginResponse } from './dto/login-response.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {

    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
        private userService: UsersService
    ) { }


    async login(loginDto: LoginDto) {

        const user = await this.userRepository.findOneBy({ username: loginDto.username });
        if (user) {
            const isValidUser = bcrypt.compareSync(loginDto.password, user.password);
            if (!!isValidUser) {
                return {
                    success: true,
                    token: this.userService.getToken(user)
                }
            }

        }
        throw new NotFoundException({ code: '400', detail: 'Invalid credentials' });
    }
    
    signUp(signUpDto: SignUpDto): Promise<LoginResponse> {
        return this.userService.create({
            username: signUpDto.username!,
            name: signUpDto.name,
            email: signUpDto.email,
            password: signUpDto.password!
        });
    }

}
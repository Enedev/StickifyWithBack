import { Injectable, NotFoundException } from '@nestjs/common';
import { SignUpDto } from './dto/sign-up.dto';
import { LoginDto } from './dto/login.dto';
import { LoginResponse } from './dto/login-response.dto'; // This DTO might need adjustment or can be removed if not strictly used for response structure
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
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
        const user = await this.userRepository.findOneBy({ email: loginDto.email }); 
        if (user) {
            const isValidUser = bcrypt.compareSync(loginDto.password, user.password);
            if (!!isValidUser) {
                // Exclude password from the user object sent to the frontend
                const { password, ...userWithoutPassword } = user; 
                return {
                    success: true,
                    token: this.userService.getToken(user),
                    user: userWithoutPassword // Include user data here for the frontend
                }
            }
        }
        throw new NotFoundException({ code: '400', detail: 'Invalid credentials' });
    }
    
    signUp(signUpDto: SignUpDto): Promise<LoginResponse> {
        // Ensure that the 'username' from signUpDto is passed correctly to userService.create
        return this.userService.create({
            username: signUpDto.username!, // Assuming username is provided in signUpDto
            email: signUpDto.email,
            password: signUpDto.password!,
            premium: signUpDto.premium || false, // Pass premium status
            followers: [], // Initialize
            following: []  // Initialize
        });
    }
}
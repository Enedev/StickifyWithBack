import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignUpDto } from './dto/sign-up.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginDto:LoginDto){
    return this.authService.login(loginDto);
  }

  @Post('sign-up')
  signUp(@Body() signUpDto:SignUpDto){
    console.log('Received signUpDto in AuthController:', signUpDto); // <--- ADD THIS LINE
    return this.authService.signUp(signUpDto);
  }


}
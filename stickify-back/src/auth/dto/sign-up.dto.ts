// src/auth/dto/sign-up.dto.ts
import { PartialType } from "@nestjs/mapped-types";
import { LoginDto } from "./login.dto"; // Asumiendo que tu LoginDto está en el mismo directorio

export class SignUpDto extends PartialType(LoginDto) { // <--- extends LoginDto para username y password
    name: string;
    email: string;
    premium?: boolean;
    followers?: string[]; 
    following?: string[];
}
export class CreateUserDto {
  username: string;
  password: string;
  email: string;
  premium?: boolean;
  followers?: string[];
  following?: string[];
}
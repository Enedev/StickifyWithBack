export class CreateUserDto {
  username: string;
  name: string;
  password: string;
  email: string;
  premium?: boolean;
  followers?: string[];
  following?: string[];
}
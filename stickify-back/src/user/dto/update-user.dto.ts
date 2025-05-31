export class UpdateUserDto {
  name?: string;
  password?: string;
  email?: string;
  premium?: boolean;
  followers?: string[];
  following?: string[];
}
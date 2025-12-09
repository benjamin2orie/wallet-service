import { IsEmail, IsOptional, IsString } from 'class-validator';

export class GoogleUserDto {
  @IsString()
  googleId: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  name?: string;
}

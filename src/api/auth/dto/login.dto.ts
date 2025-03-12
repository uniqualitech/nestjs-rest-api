import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { IsNotDisposableEmail } from 'src/validator/is-not-disposable-email.validator';

export class LoginDto {
  @ApiProperty({ example: 'johndeo@mailinator.com' })
  @IsEmail()
  @IsNotDisposableEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '12345678' })
  @IsNotEmpty()
  password: string;
}

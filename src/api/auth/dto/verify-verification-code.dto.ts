import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Length } from 'class-validator';

export class VerifyVerificationCodeDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ example: 'johndeo@mailinator.com' })
  email: string;

  @ApiProperty({ example: '9715' })
  @Length(4, 4)
  @IsNotEmpty()
  otp: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsNotEmpty } from 'class-validator';

export class SendVerificationCodeDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ example: 'johndeo@mailinator.com', required: true })
  email: string;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({ example: true, type: 'boolean', required: true })
  isForgotPasswordOtp: boolean;
}

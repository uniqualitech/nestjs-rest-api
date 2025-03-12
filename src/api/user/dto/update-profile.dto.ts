import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { Languages } from 'src/constants/app.constant';

export class UpdateProfileDto {
  @ApiProperty({
    example: Languages.EN,
    type: 'string',
    enum: Languages,
    required: false,
  })
  @IsOptional()
  language: Languages;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  profilePic: string;

  @ApiProperty({ example: 'john deo', required: false })
  @IsOptional()
  fullName: string;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  step: number;

  @ApiProperty({
    example: '2002-01-01',
    format: 'YYYY-MM-DD',
    required: false,
  })
  @IsOptional()
  dateOfBirth: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  isNotificationOn: boolean;
}

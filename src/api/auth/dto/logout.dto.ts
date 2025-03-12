import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class LogoutDto {
  @ApiProperty({ example: 'dbeee84d-9487-44c4-b7c9-6720d17f2b42-dbeee84d' })
  @IsOptional()
  deviceId: string;
}

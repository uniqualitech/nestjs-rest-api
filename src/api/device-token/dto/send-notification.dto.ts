import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class SendNotificationDto {
  @ApiProperty({ example: 'dbeee84d-9487-44c4-b7c9-6720d17f2b42....' })
  @IsNotEmpty()
  token: string;

  @ApiProperty({ example: 'Nest js basic app' })
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Hello, Me test notification!' })
  @IsNotEmpty()
  notification: string;
}

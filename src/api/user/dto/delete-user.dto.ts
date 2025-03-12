import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class DeleteUserDto {
  @ApiProperty({ example: 'Best Application' })
  @IsOptional()
  description: string;
}

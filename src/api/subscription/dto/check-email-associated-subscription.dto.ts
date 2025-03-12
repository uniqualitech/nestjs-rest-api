import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class CheckEmailAssociatedSubscriptionDto {
  @ApiProperty({
    example: '2000000077898419',
    description: 'For iOS only',
    required: true,
  })
  @IsOptional()
  transactionId: string;

  @ApiProperty({ example: '2000000077898419' })
  @IsOptional()
  orderId: string;
}

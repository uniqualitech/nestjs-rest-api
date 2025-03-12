import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { DeviceTypes } from 'src/constants/app.constant';
import { SubscriptionTypes } from 'src/constants/subscription.constant';

export class SubscribeSubscriptionDto {
  @IsNotEmpty()
  @ApiProperty({ example: SubscriptionTypes.MONTHLY, enum: SubscriptionTypes })
  @IsEnum(SubscriptionTypes)
  type: SubscriptionTypes;

  @ApiProperty({ example: 'com.basic.plan' })
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    example: 2000000658777226,
    required: true,
    description: 'Unique value',
  })
  @IsNotEmpty()
  transactionId: number;

  @ApiProperty({ example: 8.99, required: false })
  @IsOptional()
  price: number;

  @ApiProperty({ example: '$', required: false })
  @IsOptional()
  currency: string;

  @ApiProperty({ example: DeviceTypes.IOS, enum: Object.values(DeviceTypes) })
  @IsOptional()
  @IsEnum(DeviceTypes)
  purchaseState?: string;

  @ApiProperty({ example: true })
  @IsNotEmpty()
  isTestEnvironment: boolean;

  @ApiProperty({ example: 'MIIT8gYJKoZIhvcNAQcCoIIT4zCCE98CAQE....' })
  @IsNotEmpty()
  purchaseToken: string;
}

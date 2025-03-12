import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { DeviceTypes } from 'src/constants/app.constant';

export class CheckAppVersionDto {
  @ApiProperty({
    example: DeviceTypes.IOS,
    type: 'string',
    enum: Object.assign(DeviceTypes),
  })
  @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
  @IsEnum(DeviceTypes)
  platform: DeviceTypes;

  @ApiProperty({ example: 1 })
  @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
  @IsNumber()
  @Transform(({ value }) => Number(value))
  version: number;
}

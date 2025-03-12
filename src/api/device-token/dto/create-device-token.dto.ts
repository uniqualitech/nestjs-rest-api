import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { DeviceTypes } from 'src/constants/app.constant';

export class CreateDeviceTokenDto {
  @ApiProperty({
    example: 'dbeee84d-9487-44c4-b7c9-6720d17f2b42',
  })
  @IsNotEmpty()
  deviceId: string;

  @ApiProperty({
    example: DeviceTypes.IOS,
    enum: Object.assign(DeviceTypes),
  })
  @IsEnum(DeviceTypes)
  @IsNotEmpty()
  deviceType: DeviceTypes;

  @ApiProperty({
    example:
      'dbeee84d-9487-44c4-b7c9-6720d17f2b42-dbeee84d-dbeee84d-9487-44c4-b7c9-6720d17f2b429487-44c4-b7c9-6720d17f2b42-44c4-b7c9-6720d17f2b42',
  })
  @IsNotEmpty()
  token: string;
}

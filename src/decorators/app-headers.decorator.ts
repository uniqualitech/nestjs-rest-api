import { applyDecorators } from '@nestjs/common';
import { ApiHeader } from '@nestjs/swagger';
import { DeviceTypes, Languages } from 'src/constants/app.constant';

export function AppHeaders() {
  return applyDecorators(
    // Accept Language
    ApiHeader({
      name: 'Accept-Language',
      description: "User's language",
      example: Languages.EN,
      required: true,
      enum: Languages,
    }),

    // Timezone
    ApiHeader({
      name: 'Timezone',
      description: "User's timezone",
      example: 'Asia/Kolkata',
      required: true,
    }),

    // App Versions
    ApiHeader({
      name: 'App-Version',
      description: 'Version of the user application',
      example: 1,
      required: true,
    }),

    // Device Types
    ApiHeader({
      name: 'Device-Type',
      description: 'Type of device making the request',
      required: true,
      example: DeviceTypes.ANDROID,
      enum: DeviceTypes,
    }),
  );
}

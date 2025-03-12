import { HttpStatus } from '@nestjs/common';

const authentication = {
  type: 'object',
  properties: {
    accessToken: {
      type: 'string',
      example:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImpvaG4uc25vdy5hZG1pbkBtYWlsaW5hdG9yLmNvbSIsInN1YiI6IjEiLCJqdGkiOiI2YzEzYmNhNTE5MGQ4YWQ3OTU1ZmM1MzRhNjY5MTM3NmYyZWY1NWI3MzRlMmExMjk5NzFlNDU1MzU2MmI4ZTVhIiwiaWF0IjoxNjc2NTM0Mjc0LCJleHAiOjE2Nzg5NTM0NzR9.GbKyURJOhxqScct4LWLt65xuxdJPphYHcFC1ooumH_s',
    },
    refreshToken: {
      type: 'string',
      example:
        'DuAitjb1H/pnML7HTU9cnUruoOFT/K2hntcRNUKksaSBEugMyBu64ZPs+Ux8o3hd',
    },
    expiresAt: {
      type: 'number',
      example: 1678953474,
    },
  },
};

export const meta = {
  type: 'object',
  properties: {
    totalItems: {
      type: 'integer',
      example: 10,
    },
    itemsPerPage: {
      type: 'integer',
      example: 1,
    },
    totalPages: {
      type: 'integer',
      example: 1,
    },
    currentPage: {
      type: 'integer',
      example: 1,
    },
  },
};

export const BAD_REQUEST_RESPONSE = {
  status: HttpStatus.BAD_REQUEST,
  schema: {
    type: 'object',
    description: 'Response',
    properties: {
      statusCode: {
        type: 'number',
        example: HttpStatus.BAD_REQUEST,
      },
      message: {
        type: 'string',
        example: 'error message',
      },
      error: {
        type: 'string',
        example: 'Bad Request',
      },
    },
  },
};

export const UNAUTHORIZE_RESPONSE = {
  status: HttpStatus.UNAUTHORIZED,
  schema: {
    type: 'object',
    description: 'Response',
    properties: {
      statusCode: { type: 'number', example: HttpStatus.UNAUTHORIZED },
      message: {
        type: 'string',
        example: 'Unauthorized',
      },
    },
  },
};

export const CONFLICT_RESPONSE = {
  status: HttpStatus.CONFLICT,
  schema: {
    type: 'object',
    description: 'Response',
    properties: {
      statusCode: {
        type: 'number',
        example: HttpStatus.CONFLICT,
      },
      message: {
        type: 'string',
        example: 'Conflict error message',
      },
      error: {
        type: 'string',
        example: 'Conflict',
      },
    },
  },
};

export const POST_REQUEST_SUCCESS = {
  status: HttpStatus.CREATED,
  schema: {
    type: 'object',
    description: 'Response',
    properties: {
      statusCode: {
        type: 'number',
        example: HttpStatus.CREATED,
      },
      message: {
        type: 'string',
        example: 'Resource created',
      },
    },
  },
};

export const PUT_REQUEST_SUCCESS = {
  status: HttpStatus.OK,
  schema: {
    type: 'object',
    description: 'Response',
    properties: {
      statusCode: {
        type: 'number',
        example: HttpStatus.OK,
      },
      message: {
        type: 'string',
        example: 'Success',
      },
    },
  },
};

export const GET_RESPONSE_SUCCESS = {
  status: HttpStatus.OK,
  schema: {
    type: 'object',
    description: 'Response',
    properties: {
      statusCode: {
        type: 'number',
        example: HttpStatus.OK,
      },
      message: {
        type: 'string',
        example: 'Success',
      },
    },
  },
};

const country = {
  type: 'object',
  properties: {
    id: { type: 'number', example: 1 },
    name: { type: 'string', example: 'india' },
    flag: { type: 'string', example: '🇮🇳' },
    isoCode: { type: 'string', example: 'IN' },
    phoneCode: { type: 'string', example: '91' },
    currency: { type: 'string', example: 'INR' },
  },
};

const user = {
  type: 'object',
  properties: {
    id: { type: 'number', example: 1 },
    userUniqueId: {
      type: 'string',
      example: 'U65cv4nj76543e6d2gr',
    },
    language: { type: 'string', example: 'en' },
    email: { type: 'string', example: 'johndeo@mailinator.com' },
    fullName: { type: 'string', example: 'john' },
    verifiedAt: { type: 'number', example: 1676049232 },
    dateOfBirth: { type: 'number', example: 1676049232 },
    currentCountry: country,
    languageSpoken: { type: 'string', example: 'en,es' },
    communicationEmail: { type: 'string', example: 'johndeo@mailinator.com' },
    isTwoFactorAuthEnabled: { type: 'boolean', example: true },
    isNotificationOn: { type: 'boolean', example: true },
    isBlocked: { type: 'boolean', example: true },
    isFirstTimeUser: { type: 'boolean', example: false },
    isSocialLoggedIn: { type: 'boolean', example: false },
    providerType: { type: 'string', example: 'google' },
    subscriptionExpireAt: { type: 'number', example: 1676049232 },
    createdAt: { type: 'number', example: 1676049232 },
  },
};

export const USER_VERIFICATION_CODE_SEND_RESPONSE = {
  status: HttpStatus.CREATED,
  schema: {
    type: 'object',
    description: 'Response',
    properties: {
      statusCode: { type: 'number', example: HttpStatus.CREATED },
      message: {
        type: 'string',
        example: 'A verification code has been sent to your email address.',
      },
      data: user,
    },
  },
};

export const USER_LOGIN_RESPONSE = {
  status: HttpStatus.CREATED,
  schema: {
    type: 'object',
    description: 'Response',
    properties: {
      statusCode: { type: 'number', example: HttpStatus.CREATED },
      message: { type: 'string', example: 'You are successfully logged in' },
      data: {
        type: 'object',
        properties: {
          ...user.properties,
          authentication: authentication,
        },
      },
    },
  },
};

export const USER_LOGOUT_RESPONSE = {
  status: HttpStatus.CREATED,
  schema: {
    type: 'object',
    description: 'Response',
    properties: {
      statusCode: { type: 'number', example: HttpStatus.CREATED },
      message: { type: 'string', example: 'You are successfully logged out' },
    },
  },
};

export const USER_DELETE_PROFILE_RESPONSE = {
  status: HttpStatus.OK,
  schema: {
    type: 'object',
    description: 'Response',
    properties: {
      statusCode: { type: 'number', example: HttpStatus.OK },
      message: {
        type: 'string',
        example: 'Your profile has been successfully deleted',
      },
    },
  },
};

export const USER_EXISTS_RESPONSE = {
  status: HttpStatus.BAD_REQUEST,
  schema: {
    type: 'object',
    description: 'Response',
    properties: {
      statusCode: {
        type: 'number',
        example: HttpStatus.BAD_REQUEST,
      },
      message: {
        type: 'string',
        example: 'This email is already registered with us',
      },
      error: {
        type: 'string',
        example: 'Bad Request',
      },
    },
  },
};

export const INVALID_USER_RESPONSE = {
  status: HttpStatus.BAD_REQUEST,
  schema: {
    type: 'object',
    description: 'Response',
    properties: {
      statusCode: {
        type: 'number',
        example: HttpStatus.BAD_REQUEST,
      },
      message: {
        type: 'string',
        example: 'This email is not registered with us. Please register first!',
      },
      error: {
        type: 'string',
        example: 'Bad Request',
      },
    },
  },
};

export const USER_RESPONSE = {
  status: HttpStatus.OK,
  schema: {
    type: 'object',
    description: 'Response',
    properties: {
      statusCode: { type: 'number', example: HttpStatus.OK },
      message: { type: 'string', example: 'Success' },
      data: user,
    },
  },
};

export const USER_UPDATE_PROFILE_RESPONSE = {
  status: HttpStatus.CREATED,
  schema: {
    type: 'object',
    description: 'Response',
    properties: {
      statusCode: { type: 'number', example: HttpStatus.CREATED },
      message: {
        type: 'string',
        example: 'Your profile has been successfully updated',
      },
      data: user,
    },
  },
};

export const CHECK_APP_VERSION_RESPONSE = {
  status: HttpStatus.CREATED,
  schema: {
    type: 'object',
    description: 'Response',
    properties: {
      statusCode: { type: 'number', example: HttpStatus.CREATED },
      message: { type: 'string', example: 'Your app is up to date' },
      data: {
        type: 'object',
        properties: {
          status: { type: 'number', example: 0 },
          link: {
            type: 'string',
            example:
              'https://apps.apple.com/in/app/app-name/id1123496723?mt=92',
          },
        },
      },
    },
  },
};

export const REGISTER_DEVICE_TOKEN_RESPONSE = {
  status: HttpStatus.CREATED,
  schema: {
    type: 'object',
    description: 'Response',
    properties: {
      statusCode: { type: 'number', example: HttpStatus.CREATED },
      message: {
        type: 'string',
        example: 'Device token registered successfully',
      },
    },
  },
};

export const SEND_PUSH_RESPONSE = {
  status: HttpStatus.CREATED,
  schema: {
    type: 'object',
    description: 'Response',
    properties: {
      statusCode: { type: 'number', example: HttpStatus.CREATED },
      message: {
        type: 'string',
        example: 'Notification successfully sent',
      },
    },
  },
};

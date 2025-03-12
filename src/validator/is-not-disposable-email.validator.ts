import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import disposableDomains from 'disposable-email-domains';

export function IsNotDisposableEmail(validationOptions?: ValidationOptions) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,

      validator: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        validate(value: any, _args: ValidationArguments) {
          const domain = value.split('@')[1];

          return process.env.ENVIRONMENT === 'production' &&
            disposableDomains.includes(domain)
            ? false
            : true;
        },

        defaultMessage(args) {
          return `Unable to use temporary ${args.property}: ${args.value}`;
        },
      },
    });
  };
}

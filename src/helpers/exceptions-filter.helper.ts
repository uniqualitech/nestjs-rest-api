import {
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Response, Request } from 'express';
import moment from 'moment';
import { I18nValidationException } from 'nestjs-i18n';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string;
    let error: string;

    if (exception instanceof I18nValidationException) {
      // Handle I18nValidationPipe errors
      status = exception.getStatus();
      error = 'Bad Request';
      message = this.extractValidationMessage(exception.errors);
    } else if (exception instanceof BadRequestException) {
      // Handle NestJS ValidationPipe errors
      status = exception.getStatus();
      error = 'Bad Request';
      const errorResponse = exception.getResponse();
      message = this.extractValidationMessage((errorResponse as any).message);
    } else if (exception instanceof HttpException) {
      // Handle other HTTP exceptions
      status = exception.getStatus();
      const errorResponse = exception.getResponse();
      if (typeof errorResponse === 'object' && errorResponse !== null) {
        const extractedMessage = (errorResponse as any).message;
        message = Array.isArray(extractedMessage)
          ? extractedMessage[0]
          : extractedMessage;
        error = (errorResponse as any)?.error || 'Bad Request';
      }
    } else {
      // Handle unknown/internal server errors
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Oops! Something went wrong. Please try again later.';
      error = 'Internal Server Error';
      console.error(exception);
    }

    response.status(status).json({
      statusCode: status,
      message,
      error,
      datetime: moment().format('YYYY-MM-DD HH:mm:ss'),
      path: request.url,
    });
  }

  private extractValidationMessage(errors: any): string {
    if (Array.isArray(errors) && errors.length) {
      return errors[0];
    }
    return errors;
  }
}

import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>;

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (
        typeof exceptionResponse === 'object' &&
        'message' in exceptionResponse
      ) {
        return response.status(status).json({
          status: 'error',
          ...(exceptionResponse as object),
        });
      }

      return response.status(status).json({
        status: 'error',
        message: exception.message,
      });
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === 'P2002') {
        const field = (exception.meta?.target as string[])?.[0] || 'campo';
        return response.status(HttpStatus.CONFLICT).json({
          status: 'error',
          message: `${field} já está em uso`,
        });
      }

      if (exception.code === 'P2025') {
        return response.status(HttpStatus.NOT_FOUND).json({
          status: 'error',
          message: 'Registro não encontrado',
        });
      }
    }

    this.logger.error('Erro não tratado', exception);

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message:
        process.env.NODE_ENV === 'development'
          ? (exception as Error)?.message || 'Erro interno do servidor'
          : 'Erro interno do servidor',
    });
  }
}

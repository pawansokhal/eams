import { ExceptionFilter, Catch, ArgumentsHost, HttpException, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const response = host.switchToHttp().getResponse<Response>();
        const status = exception.getStatus();
        const exceptionResponse = exception.getResponse();

        let message = 'Internal server error';

        // Check if exceptionResponse is an object with a 'message' property
        if (exceptionResponse && typeof exceptionResponse === 'object' && 'message' in exceptionResponse) {
            message = (exceptionResponse as any).message || message;
        } else if (exception instanceof BadRequestException) {
            message = exceptionResponse && exceptionResponse['message']
                ? exceptionResponse['message']
                : 'Bad request: Please check your input data';
        } else if (exception instanceof NotFoundException) {
            message = 'The resource you are looking for was not found';
        } else if (exception instanceof UnauthorizedException) {
            message = 'Unauthorized: Please login to continue';
        } else if (typeof exceptionResponse === 'string') {
            message = exceptionResponse;
        }

        response.status(status).json({
            statusCode: status,
            message: message,
            error: exceptionResponse['error'] || 'Internal Server Error',
        });
    }
}

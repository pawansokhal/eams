import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RolesGuard } from './auth/roles.guard';
import { Reflector } from '@nestjs/core';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { HttpExceptionFilter } from './common/http-exception.filter';
import { RequestLoggingInterceptor } from './interceptors/request-logging.interceptor';



async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(new ValidationPipe({
    exceptionFactory: (errors) => {
      const message = errors
        .map(error => {
          const constraintsMessages = error.constraints ? Object.values(error.constraints).join(', ') : 'Unknown validation error';
          return `${error.property}: ${constraintsMessages}`;
        })
        .join('; ');
      return new BadRequestException(message);
    },
    forbidUnknownValues: false,
    validateCustomDecorators: true,
    transform: true,
  }));
  app.useGlobalInterceptors(new RequestLoggingInterceptor());


  await app.listen(3000);
}
bootstrap();

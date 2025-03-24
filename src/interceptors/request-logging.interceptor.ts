import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { tap } from 'rxjs/operators';

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request: Request = context.switchToHttp().getRequest();
        const method = request.method;
        const url = request.url;
        const timestamp = new Date().toISOString();

        // Log the incoming request
        console.log(`[${timestamp}] ${method} ${url}`);

        // Continue to the next handler
        return next.handle().pipe(
            tap(() => {
                // Log response details (if needed)
                console.log(`[${timestamp}] Response sent for ${method} ${url}`);
            })
        );
    }
}

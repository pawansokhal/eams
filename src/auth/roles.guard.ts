import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const roles = this.reflector.get<string[]>('roles', context.getHandler());
        if (!roles) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;
        // console.log('---roles--', roles, user.role)

        if (!user || !user.role) {
            console.log('RolesGuard - User or user role is missing');
            return false;
        }

        if (!roles.includes(user.role)) {
            console.log('RolesGuard - User does not have the required role');
            return false;
        }

        return true;
    }
}

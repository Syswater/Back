import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

@Injectable()
export class RolesAuthGuard extends JwtAuthGuard {
    constructor(private readonly allowedRoles: string[]) {
        super();
    }

    canActivate(context: ExecutionContext) {
        const isAuth = super.canActivate(context);
        if (!isAuth) {
            return false;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user || !user.roles) {
            throw new UnauthorizedException('User does not have required roles');
        }

        const hasRole = user.roles.some(role => this.allowedRoles.includes(role));
        if (!hasRole) {
            throw new UnauthorizedException('User does not have required roles');
        }

        return true;
    }
}

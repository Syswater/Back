import { Injectable, ExecutionContext, UnauthorizedException, CanActivate, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../constants/role';
import { User } from '../../user/entities/user.entity';
import { METADATA_ROLES } from '../decorators/roles.decorator';

@Injectable()
export class RolesAuthGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const requiredRoles = this.reflector.getAllAndOverride<Role[]>(METADATA_ROLES, [
                context.getHandler(),
                context.getClass(),
            ]);

            if (!requiredRoles || requiredRoles.length == 0) {
                resolve(true);
            }

            const { user } = context.switchToHttp().getRequest();
            const hasRole = requiredRoles.some((role) => user.user?.roles ? User.getRoles(user.user.roles).includes(role) : false);
            if (hasRole) {
                resolve(true);
            } else {
                reject(new UnauthorizedException());
            }
        });
    }
}

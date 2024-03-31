import { Injectable } from '@nestjs/common';
import { Role } from '../constants/role';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {

    public getroles(user: User): Role[] {
        if (!user.roles) return [];
        const rolesArray = user.roles.split(',').map(role => role.trim());
        const validRoles: Role[] = rolesArray
            .filter(role => Object.values(Role).includes(role as Role))
            .map(role => role as Role);
        return validRoles;
    }
}

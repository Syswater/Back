import { Injectable } from '@nestjs/common';
import { Role } from '../constants/role';
import { User } from './entities/user.entity';
import { UserDto } from './dto/user.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) { }

    public getroles(user: User): Role[] {
        if (!user.roles) return [];
        const rolesArray = user.roles.split(',').map(role => role.trim());
        const validRoles: Role[] = rolesArray
            .filter(role => Object.values(Role).includes(role as Role))
            .map(role => role as Role);
        return validRoles;
    }

    public async getByUsername(username: string): Promise<User> {
        return this.prisma.user.findFirst({ where: { username } })
    }

    public toDto(user: User): UserDto {
        const { id, name, cellphone, username, roles } = user;
        return { id, name, cellphone, username, roles };
    }
}

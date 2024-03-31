import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { user } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '../user/entities/user.entity';

@Injectable()
export class AuthService {
    constructor(private readonly jwtService: JwtService, private readonly prisma: PrismaService) { }

    async validateUser(username: string, password: string): Promise<any> {
        const user: User = await this.prisma.user.findFirst({ where: { username, password } });
        if (user && user.password === password && user.username === username) {
            return user;
        }
        return null;
    }

    async generateJwtToken(userId: string): Promise<string> {
        const payload = { userId };
        return this.jwtService.sign(payload);
    }
}

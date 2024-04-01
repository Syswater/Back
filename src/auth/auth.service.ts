import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '../user/entities/user.entity';
import { user } from '@prisma/client';
import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService {
    constructor(private readonly jwtService: JwtService, private readonly prisma: PrismaService) { }

    async validateUser(username: string, password: string): Promise<any> {
        const user: User = await this.prisma.user.findFirst({ where: { username } });
        if (user && user.username === username && await bcrypt.compare(password, user.password)) {
            return user;
        }
        return null;
    }

    async generateJwtToken(user: user): Promise<string> {
        const payload = { user };
        return this.jwtService.sign(payload);
    }
}

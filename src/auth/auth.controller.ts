import { Controller, Post, Body, UnauthorizedException, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from '../user/entities/user.entity';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Public()
    @Post('login')
    async login(@Body() credentials: { username: string, password: string }) {
        const { username, password } = credentials;
        const user: User = await this.authService.validateUser(username, password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const token = await this.authService.generateJwtToken(user);
        return { token };
    }

    @Delete('logout')
    async logout() {
        return { message: 'Logout successful' };
    }
}

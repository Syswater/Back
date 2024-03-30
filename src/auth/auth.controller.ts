import { Controller, Post, Body, UnauthorizedException, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    async login(@Body() credentials: { username: string, password: string }) {
        const { username, password } = credentials;

        const user = await this.authService.validateUser(username, password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const token = await this.authService.generateJwtToken(user.id);
        return { token };
    }

    @Delete('logout')
    async logout() {
        return { message: 'Logout successful' };
    }
}

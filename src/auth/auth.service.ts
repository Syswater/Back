import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(private readonly jwtService: JwtService) { }

    async validateUser(username: string, password: string): Promise<any> {
        // Aquí implementamos la lógica de verificación de usuario y contraseña
        // Consultar una base de datos para buscar el usuario
        const user = { name: "Lola", password: "ggg" };
        if (user && user.password === password) {
            return user;
        }
        return null;
    }

    async generateJwtToken(userId: string): Promise<string> {
        const payload = { userId };
        return this.jwtService.sign(payload);
    }
}

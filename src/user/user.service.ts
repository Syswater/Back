import { Injectable } from '@nestjs/common';
import { Role } from '../constants/role';
import { User } from './entities/user.entity';
import { UserDto } from './dto/user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserInput } from './dto/create_user.input';
import * as bcrypt from 'bcrypt';
import { SearchUserInput } from './dto/search_user.input';
import { UserError, UserErrorCode } from '../exceptions/user-error';
import { dbHandleError } from '../exceptions/db_handler';
import { UpdateUserInput } from './dto/update_user.input';
import { ChangePasswordInput } from './dto/change-password.input';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  public getroles(user: User): Role[] {
    if (!user.roles) return [];
    const rolesArray = user.roles.split(',').map((role) => role.trim());
    const validRoles: Role[] = rolesArray
      .filter((role) => Object.values(Role).includes(role as Role))
      .map((role) => role as Role);
    return validRoles;
  }

  public async getByUsername(username: string): Promise<User> {
    return this.prisma.user.findFirst({ where: { username } });
  }

  toDto(user: User): UserDto {
    const { id, name, cellphone, username, roles } = user;
    return { id, name, cellphone, username, roles };
  }

  public async createUser(input: CreateUserInput) {
    let { cellphone, name, password, roles, username } = input;
    password = await bcrypt.hash(password, 16);
    const existingUser = await this.prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      throw new UserError(
        UserErrorCode.EXISTING_USERNAME,
        `El nombre de usuario ya se encuentra registrado en la base de datos:  ${username}`,
      );
    } else {
      return this.toDto(
        await this.prisma.user.create({
          data: {
            cellphone,
            name,
            password,
            roles: User.rolesToString(roles),
            username,
          },
        }),
      );
    }
  }

  public async findAll(input: SearchUserInput): Promise<UserDto[]> {
    const { filter } = input;
    let where = {};
    if (filter) {
      where = {
        OR: [
          { name: { contains: filter } },
          { username: { contains: filter } },
          { cellphone: { contains: filter } },
        ],
      };
    }
    const users = await this.prisma.user.findMany({ where });
    return users.map((user) => this.toDto(user));
  }

  async delete(id: number): Promise<UserDto> {
    try {
      const user = await this.prisma.user.findFirst({
        where: { id, delete_at: null },
      });

      if (!user) {
        throw new UserError(
          UserErrorCode.USER_NOT_FOUND,
          `No se encuentra la ruta con el id ${id}`,
        );
      } else {
        const deleted = await this.prisma.$transaction(
          async (tx) => {
            await tx.user.update({
              where: { id: user.id },
              data: { username: null },
            });
            const deletedUser = await tx.user.delete({
              where: { id },
            });
            return deletedUser;
          },
          {
            maxWait: 10000,
            timeout: 25000,
          },
        );

        return this.toDto(deleted);
      }
    } catch (e) {
      dbHandleError(e);
    }
  }

  async update(input: UpdateUserInput) {
    const { id, cellphone, name, roles } = input;
    return this.toDto(
      await this.prisma.user.update({
        where: { id },
        data: {
          cellphone,
          name,
          roles: roles ? User.rolesToString(roles) : undefined,
        },
      }),
    );
  }

  async changePassword(input: ChangePasswordInput): Promise<boolean> {
    let { username, newPassword, oldPassword } = input;
    let user = await this.getByUsername(username);

    if (await bcrypt.compare(oldPassword, user.password)) {
      newPassword = await bcrypt.hash(newPassword, 16);
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { password: newPassword },
      });
    } else {
      throw new UserError(
        UserErrorCode.WRONG_USER_PASSWORD,
        `Contraseña incorrecta`,
      );
    }

    return true;
  }

  async findDistributionUsers(distribution_id: number): Promise<UserDto[]> {
    const users = await this.prisma.user.findMany({
      where: { distribution_user: { some: { distribution_id } } },
    });
    return users.map((user) => this.toDto(user));
  }
}

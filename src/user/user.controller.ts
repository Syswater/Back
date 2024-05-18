import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CreateUserInput } from './dto/create_user.input';
import { UserService } from './user.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { Role } from '../constants/role';
import { DeleteUserInput } from './dto/delete_user.input';
import { UpdateUserInput } from './dto/update_user.input';
import { ChangePasswordInput } from './dto/change-password.input';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Auth(Role.ADMIN)
  @Get('findAll')
  async findAll(@Query('filter') filter: string, @Query('role') role: string) {
    try {
      return await this.userService.findAll({ filter, role });
    } catch (error) {
      throw new BadRequestException(
        'Los datos proporcionados son incorrectos',
        error,
      );
    }
  }

  @Auth(Role.ADMIN, Role.DISTRIBUTOR, Role.ADMIN)
  @Get('getDistributionUsers')
  async findgetDistributionUsers(
    @Query('distribution_id') distribution_id: string,
  ) {
    try {
      return await this.userService.findDistributionUsers(
        parseInt(distribution_id),
      );
    } catch (error) {
      throw new BadRequestException(
        'Los datos proporcionados son incorrectos',
        error,
      );
    }
  }

  @Auth(Role.ADMIN)
  @Post('create')
  async creteUser(@Body() input: CreateUserInput) {
    try {
      return this.userService.createUser(input);
    } catch (error) {
      throw new BadRequestException(
        'Los datos proporcionados son incorrectos',
        error,
      );
    }
  }

  @Auth(Role.ADMIN)
  @Delete('delete')
  async deleteUser(@Body() input: DeleteUserInput) {
    try {
      return this.userService.delete(input.id);
    } catch (error) {
      throw new BadRequestException(
        'Los datos proporcionados son incorrectos',
        error,
      );
    }
  }

  @Auth(Role.ADMIN)
  @Put('update')
  async updateUser(@Body() input: UpdateUserInput) {
    try {
      return this.userService.update(input);
    } catch (error) {
      throw new BadRequestException(
        'Los datos proporcionados son incorrectos',
        error,
      );
    }
  }

  @Auth(Role.ADMIN, Role.DISTRIBUTOR, Role.PRE_SELLER)
  @Put('change-password')
  async changePassword(@Body() input: ChangePasswordInput) {
    try {
      return this.userService.changePassword(input);
    } catch (error) {
      throw new BadRequestException(
        'Los datos proporcionados son incorrectos',
        error,
      );
    }
  }
}

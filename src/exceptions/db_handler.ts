import { Prisma } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';

export function dbHandleError(e: any): void {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    if (e.code === 'P2002') {
      throw new BadRequestException(
        `Ya existe un registro con este ${e.meta?.target}`,
      );
    }
    if (e.code === 'P2025') {
      throw new BadRequestException(`Registro a actualizar no encontrado.`);
    }
  }
  throw e;
}

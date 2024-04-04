import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TriggersService {
  constructor(private readonly prisma: PrismaService) {
    this.prisma.$use(async (params, next) => {

      if (params.action == 'update') {
        params.args.data = {
          ...params.args.data,
          update_at: new Date(),
        } as object;
      }

      if (params.model == 'user') {
        if (params.action === 'findUnique' || params.action === 'findFirst') {
          params.action = 'findFirst';
          params.args.where['delete_at'] = null;
        }
        if (params.action === 'findMany') {
          if (params.args.where) {
            if (params.args.where.delete_at == undefined) {
              params.args.where['delete_at'] = null;
            }
          } else {
            params.args['where'] = { delete_at: null };
          }
        }
        if (params.action === 'count') {
          if (params.args.where) {
            if (params.args.where.delete_at == undefined) {
              params.args.where['delete_at'] = null;
            }
          } else {
            params.args['where'] = { delete_at: null };
          }
        }

        if (params.action == 'delete') {
          params.action = 'update';
          params.args['data'] = { delete_at: new Date() };
        }
        if (params.action == 'deleteMany') {
          params.action = 'updateMany';
          if (params.args.data != undefined) {
            params.args.data['delete_at'] = new Date();
          } else {
            params.args['data'] = { delete_at: new Date() };
          }
        }
      }
      return next(params);
    });
  }
}

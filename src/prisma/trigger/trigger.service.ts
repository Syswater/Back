import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class TriggerService {

  constructor(readonly prisma: PrismaService) {
    prisma.$use(async (params, next): Promise<any> => {


      if (params.action == 'update' && params.model != 'note' && params.model != 'expense_category') {
        params.args.data = {
          ...params.args.data,
          update_at: new Date(),
        } as object;
      }

      if (
        params.model == 'user' ||
        params.model == 'route'
      ) {
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
      }

      return next(params);
    });
  }
}

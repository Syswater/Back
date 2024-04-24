import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { DistributionDto } from '../dto/distributionDTO/distribution.output';
import { $Enums, distribution, route } from '@prisma/client';
import { Distribution } from '../entities/distribution.entity';
import { CreateDistributionInput } from '../dto/distributionDTO/create-distribution.input';
import { UpdateDistributionInput } from '../dto/distributionDTO/update-distrivution.input';
import { ChangeStatusDistributionInput } from '../dto/distributionDTO/changeStatus-distribution.input';
import { DistributionError, DistributionErrorCode } from 'src/exceptions/distribution-error';
import { RouteDto } from 'src/route/dto/route.output';
import { convertWeekdaysToEnum, splitWeekdaysString } from 'src/constants/weekday';

@Injectable()
export class DistributionService {

    constructor(private readonly prisma: PrismaService) { }

    async getDistribution(search: {initDate?:Date, finalDate?:Date, status?:$Enums.distribution_status, route_id?:number, with_route?:boolean}): Promise<DistributionDto[]> {
        const { initDate, finalDate, status, route_id, with_route } = search;
        let where= {};
        if(initDate || route_id || status){
            where = {
                    status,
                    route_id,
                    date: initDate? finalDate? { gte: initDate.toISOString(), lte: finalDate.toISOString() } : { date: { equals: initDate.toISOString()} }: {}
            };
        }
    
        const distributions = await this.prisma.distribution.findMany({
            where,
            select: {
                id: true,
                date: true,
                load_up: true,
                broken_containers: true,
                status: true,
                route_id: true,
                product_inventory_id: true,
                delete_at:true,
                update_at: true,
                route: with_route? {select: {id:true, name: true, location: true, weekdays: true, price: true}} : undefined
            }
        });
    
        return distributions.map(distribution => {
            const {route, ...info} = distribution;
            return this.getDistributionDto(info, {...route, weekdays: route?convertWeekdaysToEnum(splitWeekdaysString(route.weekdays)):undefined });
        });
    }

    async create(distribution: CreateDistributionInput): Promise<DistributionDto> {
        const {route_id} = distribution;
        await this.prisma.route.findFirstOrThrow({where:{id:distribution.route_id, delete_at: null}});
        await this.prisma.product_inventory.findFirstOrThrow({where:{id:distribution.product_inventory_id, delete_at: null}});
        const existingDistribution = await this.prisma.distribution.findFirst({where:{route_id, status:{not:$Enums.distribution_status.CLOSED}, delete_at: null}})
        if(existingDistribution) throw new DistributionError(DistributionErrorCode.EXISTING_DISTRIBUTION, `Ya existe una distribución que no esta cerrada para la ruta dada`);
        const newDistribution = await this.prisma.distribution.create({ data: distribution });
        return this.getDistributionDto(newDistribution);
    }

    async update(distribution: UpdateDistributionInput): Promise<DistributionDto> {
        const {id, ...info} = distribution;
        const updateDistribution = await this.prisma.distribution.update({
            where: { id },
            data: { ...info }
        })
        return this.getDistributionDto(updateDistribution)
    }

    async changeStatus(statusInput: ChangeStatusDistributionInput): Promise<DistributionDto>{
        const {id, status} = statusInput;
        const distribution = await this.prisma.distribution.findFirstOrThrow({where:{id, delete_at: null, status: {not: $Enums.distribution_status.CLOSED}}});
        if(status == $Enums.distribution_status.PREORDER) throw new DistributionError(DistributionErrorCode.STATUS_PREORDER_CHANGE, `No se puede cambiar al estado PREORDER`);
        if(distribution.status == $Enums.distribution_status.PREORDER && status != $Enums.distribution_status.OPENED) throw new DistributionError(DistributionErrorCode.STATUS_PREORDER_CHANGE, `De estado PREORDER solo s puede cambiar a estado OPENED`);
        if(distribution.status == $Enums.distribution_status.OPENED && status != $Enums.distribution_status.CLOSED) throw new DistributionError(DistributionErrorCode.STATUS_PREORDER_CHANGE, `De estado OPENED solo s puede cambiar a estado CLOSED o CLOSED_REQUEST`);
        if(distribution.status == $Enums.distribution_status.OPENED && status != $Enums.distribution_status.CLOSE_REQUEST) throw new DistributionError(DistributionErrorCode.STATUS_PREORDER_CHANGE, `De estado OPENED solo s puede cambiar a estado CLOSED o CLOSED_REQUEST`);
        const updateDistribution = await this.prisma.distribution.update({ where: { id }, data: { status } });
        if(updateDistribution.status === $Enums.distribution_status.CLOSED){
            await this.prisma.note.deleteMany({where: {distribution_id: updateDistribution.id}})
        }
        return this.getDistributionDto(updateDistribution)
    } 

    async delete(id: number): Promise<DistributionDto> {
        const distribution = await this.prisma.distribution.findFirstOrThrow({ where: { id, delete_at: null } });
        const deletedDistribution = await this.prisma.distribution.delete({
            where: { id }
        });
        return this.getDistributionDto(deletedDistribution);
    }

    private getDistributionDto(distribution:Distribution, route?:RouteDto): DistributionDto {
        const { update_at, delete_at, ...info } = distribution;
        return { ...info, route };
    }

}

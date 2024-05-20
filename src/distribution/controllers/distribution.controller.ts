import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { DistributionService } from '../services/distribution.service';
import { DistributionDto } from '../dto/distributionDTO/distribution.output';
import { $Enums } from '@prisma/client';
import { CreateDistributionInput } from '../dto/distributionDTO/create-distribution.input';
import { UpdateDistributionInput } from '../dto/distributionDTO/update-distrivution.input';
import { DeleteDistributionInput } from '../dto/distributionDTO/delete-distribution.input';
import { ChangeStatusDistributionInput } from '../dto/distributionDTO/changeStatus-distribution.input';
import { InitDistributionInput } from '../dto/distributionDTO/init-distribution.input';
import { OpenDistributionInput } from '../dto/distributionDTO/open-distribution.input';
import { CloseDistributionInput } from '../dto/distributionDTO/close-distribution.input';

@Controller('distribution')
export class DistributionController {
  constructor(private readonly distributionService: DistributionService) {}

  @Get('findAll')
  async findAll(
    @Query('route_id') route_id?: string,
    @Query('status') status?: string,
    @Query('initDate') initDate?: string,
    @Query('finalDate') finalDate?: string,
    @Query('with_route') with_route?: string,
    @Query('distributor_id') distributor_id?: string,
  ): Promise<DistributionDto[]> {
    try {
      const inputStatus: $Enums.distribution_status[] = [];
      for (let stat of status ? status.split(',') : []) {
        stat = stat.trim();
        if (!$Enums.distribution_status[stat.replace(/\s+/g, '')]) {
          throw new BadRequestException(
            'Los datos proporcionados son incorrectos',
          );
        }
        if ($Enums.distribution_status[stat])
          inputStatus.push(stat as $Enums.distribution_status);
      }

      return this.distributionService.getDistribution({
        route_id: route_id ? parseInt(route_id) : undefined,
        status: inputStatus.length > 0?inputStatus:undefined,
        initDate: initDate ? new Date(initDate) : undefined, // yyyy-mm-dd
        finalDate: finalDate ? new Date(finalDate) : undefined,
        with_route: with_route?.toLowerCase() === 'true',
        distributor_id: distributor_id ? parseInt(distributor_id) : undefined,
      });
    } catch (error) {
      throw new BadRequestException('Los datos proporcionados son incorrectos');
    }
  }

  @Post('create')
  async create(
    @Body() distribution: CreateDistributionInput,
  ): Promise<DistributionDto> {
    try {
      const newDistribution =
        await this.distributionService.create(distribution);
      return newDistribution;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Post('initDistribution')
  async initDistribution(
    @Body() distribution: InitDistributionInput,
  ): Promise<DistributionDto> {
    try {
      const newDistribution =
        await this.distributionService.initDistribution(distribution);
      return newDistribution;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Put('update')
  async update(
    @Body() distribution: UpdateDistributionInput,
  ): Promise<DistributionDto> {
    try {
      const updatedDistribution =
        await this.distributionService.update(distribution);
      return updatedDistribution;
    } catch (error) {
      throw new BadRequestException('Los datos proporcionados son incorrectos');
    }
  }

  @Put('changeStatus')
  async changeStatus(
    @Body() distribution: ChangeStatusDistributionInput,
  ): Promise<DistributionDto> {
    try {
      const updatedDistribution =
        await this.distributionService.changeStatus(distribution);
      return updatedDistribution;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Delete('delete')
  async delete(
    @Body() params: DeleteDistributionInput,
  ): Promise<DistributionDto> {
    return await this.distributionService.delete(params.id);
  }

  @Get('report/:id')
  async getReport(@Param() params: any) {
    return await this.distributionService.getReport(parseInt(params.id));
  }

  @Post('open')
  async openDistribution(
    @Body() distribution: OpenDistributionInput,
  ): Promise<boolean> {
    try {
      await this.distributionService.openDistribution(distribution);
      return true;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Post('close')
  async closeDistribution(
    @Body() distribution: CloseDistributionInput,
  ): Promise<boolean> {
    try {
      await this.distributionService.closeDistribution(distribution);
      return true;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}

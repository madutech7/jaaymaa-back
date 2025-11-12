import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ShippingService } from './shipping.service';
import { CreateShippingMethodDto } from './dto/create-shipping-method.dto';
import { UpdateShippingMethodDto } from './dto/update-shipping-method.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('shipping')
@Controller('shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active shipping methods' })
  findAll() {
    return this.shippingService.findAll();
  }

  @Get('admin')
  @ApiOperation({ summary: 'Get all shipping methods (Admin only)' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  findAllAdmin() {
    return this.shippingService.findAllAdmin();
  }

  @Get('calculate')
  @ApiOperation({ summary: 'Calculate shipping for order' })
  @ApiQuery({ name: 'subtotal', required: true, type: Number })
  @ApiQuery({ name: 'country', required: false, type: String })
  calculateShipping(@Query('subtotal') subtotal: number, @Query('country') country?: string) {
    return this.shippingService.calculateShipping(subtotal, country);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get shipping method by ID' })
  findOne(@Param('id') id: string) {
    return this.shippingService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create shipping method (Admin only)' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  create(@Body() createDto: CreateShippingMethodDto) {
    return this.shippingService.create(createDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update shipping method (Admin only)' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() updateDto: UpdateShippingMethodDto) {
    return this.shippingService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete shipping method (Admin only)' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.shippingService.remove(id);
  }
}



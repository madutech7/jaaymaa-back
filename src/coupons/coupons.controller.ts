import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('coupons')
@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post()
  @ApiOperation({ summary: 'Create coupon (Admin only)' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  create(@Body() createCouponDto: CreateCouponDto) {
    return this.couponsService.create(createCouponDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all coupons (Admin only)' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  findAll() {
    return this.couponsService.findAll();
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Get coupon by code (Public)' })
  async getCouponByCode(@Param('code') code: string) {
    return await this.couponsService.findByCode(code);
  }

  @Get('validate/:code')
  @ApiOperation({ summary: 'Validate coupon code' })
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiQuery({ name: 'amount', required: true, type: Number })
  async validateCoupon(@Param('code') code: string, @Query('amount') amount: number) {
    const coupon = await this.couponsService.validateCoupon(code, amount);
    return { valid: true, coupon };
  }

  @Post('apply/:code')
  @ApiOperation({ summary: 'Apply coupon to order' })
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  applyCoupon(@Param('code') code: string, @Body('amount') amount: number) {
    return this.couponsService.applyCoupon(code, amount);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get coupon by ID (Admin only)' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  findOne(@Param('id') id: string) {
    return this.couponsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update coupon (Admin only)' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() updateCouponDto: UpdateCouponDto) {
    return this.couponsService.update(id, updateCouponDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete coupon (Admin only)' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.couponsService.remove(id);
  }
}



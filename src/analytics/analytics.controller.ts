import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('track/product-view')
  @ApiOperation({ summary: 'Track product view' })
  trackProductView(@Body() data: any) {
    return this.analyticsService.trackProductView(data);
  }

  @Get('product-views/:productId')
  @ApiOperation({ summary: 'Get product views count' })
  async getProductViews(@Param('productId') productId: string) {
    const count = await this.analyticsService.getProductViews(productId);
    return { product_id: productId, view_count: count };
  }

  @Get('most-viewed')
  @ApiOperation({ summary: 'Get most viewed products (Admin only)' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  getMostViewedProducts(@Query('limit') limit?: number) {
    return this.analyticsService.getMostViewedProducts(limit ? parseInt(limit.toString()) : 10);
  }

  @Post('abandoned-carts')
  @ApiOperation({ summary: 'Track abandoned cart' })
  trackAbandonedCart(@Body() data: any) {
    return this.analyticsService.trackAbandonedCart(data);
  }

  @Get('abandoned-carts')
  @ApiOperation({ summary: 'Get abandoned carts (Admin only)' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  getAbandonedCarts() {
    return this.analyticsService.getAbandonedCarts();
  }
}



import { Controller, Get, Post, Body, Delete, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MarketingService } from './marketing.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('marketing')
@Controller('marketing')
export class MarketingController {
  constructor(private readonly marketingService: MarketingService) {}

  @Get('banners')
  @ApiOperation({ summary: 'Get active promotional banners' })
  findActiveBanners() {
    return this.marketingService.findActiveBanners();
  }

  @Post('newsletter/subscribe')
  @ApiOperation({ summary: 'Subscribe to newsletter' })
  subscribe(@Body() data: { email: string; first_name?: string; last_name?: string }) {
    return this.marketingService.subscribe(data.email, data.first_name, data.last_name);
  }

  @Post('newsletter/unsubscribe')
  @ApiOperation({ summary: 'Unsubscribe from newsletter' })
  async unsubscribe(@Body('email') email: string) {
    await this.marketingService.unsubscribe(email);
    return { message: 'Successfully unsubscribed' };
  }

  @Get('newsletter/count')
  @ApiOperation({ summary: 'Get subscriber count (Admin only)' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  async getSubscriberCount() {
    const count = await this.marketingService.getSubscriberCount();
    return { count };
  }

  @Get('templates')
  @ApiOperation({ summary: 'Get email templates (Admin only)' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  findAllTemplates() {
    return this.marketingService.findAllTemplates();
  }
}



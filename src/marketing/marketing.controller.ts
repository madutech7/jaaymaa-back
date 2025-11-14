import { Controller, Get, Post, Body, Patch, Delete, Param, UseGuards } from '@nestjs/common';
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
  @ApiOperation({ summary: 'Get all email templates (Admin only)' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  findAllTemplates() {
    return this.marketingService.findAllTemplates();
  }

  @Get('templates/:id')
  @ApiOperation({ summary: 'Get email template by ID (Admin only)' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  findOneTemplate(@Param('id') id: string) {
    return this.marketingService.findOneTemplate(id);
  }

  @Post('templates')
  @ApiOperation({ summary: 'Create email template (Admin only)' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  createTemplate(@Body() templateData: {
    name: string;
    subject: string;
    body_html: string;
    body_text?: string;
    variables?: string[];
    is_active?: boolean;
  }) {
    return this.marketingService.createTemplate(templateData);
  }

  @Patch('templates/:id')
  @ApiOperation({ summary: 'Update email template (Admin only)' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  updateTemplate(
    @Param('id') id: string,
    @Body() updates: {
      subject?: string;
      body_html?: string;
      body_text?: string;
      variables?: string[];
      is_active?: boolean;
    }
  ) {
    return this.marketingService.updateTemplate(id, updates);
  }

  @Delete('templates/:id')
  @ApiOperation({ summary: 'Delete email template (Admin only)' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  async deleteTemplate(@Param('id') id: string) {
    await this.marketingService.deleteTemplate(id);
    return { message: 'Template deleted successfully' };
  }

  @Post('templates/:id/render')
  @ApiOperation({ summary: 'Render email template with variables (Admin only)' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  renderTemplate(
    @Param('id') id: string,
    @Body('variables') variables: Record<string, string>
  ) {
    return this.marketingService.renderTemplate(id, variables || {});
  }
}



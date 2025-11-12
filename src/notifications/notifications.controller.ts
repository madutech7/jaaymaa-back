import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all user notifications' })
  findAll(@CurrentUser() user: User) {
    return this.notificationsService.findAll(user.id);
  }

  @Get('unread')
  @ApiOperation({ summary: 'Get unread notifications' })
  findUnread(@CurrentUser() user: User) {
    return this.notificationsService.findUnread(user.id);
  }

  @Get('unread/count')
  @ApiOperation({ summary: 'Count unread notifications' })
  async countUnread(@CurrentUser() user: User) {
    const count = await this.notificationsService.countUnread(user.id);
    return { count };
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  markAsRead(@Param('id') id: string, @CurrentUser() user: User) {
    return this.notificationsService.markAsRead(id, user.id);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllAsRead(@CurrentUser() user: User) {
    await this.notificationsService.markAllAsRead(user.id);
    return { message: 'All notifications marked as read' };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete notification' })
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    await this.notificationsService.remove(id, user.id);
    return { message: 'Notification deleted' };
  }

  @Delete()
  @ApiOperation({ summary: 'Delete all notifications' })
  async removeAll(@CurrentUser() user: User) {
    await this.notificationsService.removeAll(user.id);
    return { message: 'All notifications deleted' };
  }
}



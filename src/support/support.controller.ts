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
import { SupportService } from './support.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('support')
@Controller('support')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post('tickets')
  @ApiOperation({ summary: 'Create support ticket' })
  createTicket(@Body() createTicketDto: CreateTicketDto, @CurrentUser() user: User) {
    return this.supportService.createTicket(createTicketDto, user.id);
  }

  @Get('tickets')
  @ApiOperation({ summary: 'Get all tickets' })
  findAllTickets(@CurrentUser() user: User) {
    return this.supportService.findAllTickets(user.role === 'admin' ? undefined : user.id);
  }

  @Get('tickets/:id')
  @ApiOperation({ summary: 'Get ticket by ID' })
  findOneTicket(@Param('id') id: string, @CurrentUser() user: User) {
    return this.supportService.findOneTicket(id, user.role === 'admin' ? undefined : user.id);
  }

  @Patch('tickets/:id')
  @ApiOperation({ summary: 'Update ticket (Admin only)' })
  @UseGuards(RolesGuard)
  @Roles('admin')
  updateTicket(@Param('id') id: string, @Body() updateTicketDto: UpdateTicketDto) {
    return this.supportService.updateTicket(id, updateTicketDto);
  }

  @Post('tickets/:id/messages')
  @ApiOperation({ summary: 'Add message to ticket' })
  addMessage(
    @Param('id') ticketId: string,
    @Body() createMessageDto: CreateMessageDto,
    @CurrentUser() user: User,
  ) {
    return this.supportService.addMessage(
      ticketId,
      createMessageDto,
      user.id,
      user.role === 'admin',
    );
  }

  @Delete('tickets/:id')
  @ApiOperation({ summary: 'Delete ticket (Admin only)' })
  @UseGuards(RolesGuard)
  @Roles('admin')
  async removeTicket(@Param('id') id: string) {
    await this.supportService.removeTicket(id);
    return { message: 'Ticket deleted' };
  }
}



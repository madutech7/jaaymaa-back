import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupportTicket } from './entities/support-ticket.entity';
import { TicketMessage } from './entities/ticket-message.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class SupportService {
  constructor(
    @InjectRepository(SupportTicket)
    private ticketsRepository: Repository<SupportTicket>,
    @InjectRepository(TicketMessage)
    private messagesRepository: Repository<TicketMessage>,
  ) {}

  async createTicket(createTicketDto: CreateTicketDto, userId: string): Promise<SupportTicket> {
    const ticket = this.ticketsRepository.create({
      ...createTicketDto,
      user_id: userId,
    });
    return await this.ticketsRepository.save(ticket);
  }

  async findAllTickets(userId?: string): Promise<SupportTicket[]> {
    const query = this.ticketsRepository.createQueryBuilder('ticket');

    if (userId) {
      query.where('ticket.user_id = :userId', { userId });
    }

    query.leftJoinAndSelect('ticket.user', 'user');
    query.leftJoinAndSelect('ticket.messages', 'messages');
    query.orderBy('ticket.created_at', 'DESC');

    return await query.getMany();
  }

  async findOneTicket(id: string, userId?: string): Promise<SupportTicket> {
    const query = this.ticketsRepository.createQueryBuilder('ticket');

    query.where('ticket.id = :id', { id });

    if (userId) {
      query.andWhere('ticket.user_id = :userId', { userId });
    }

    query.leftJoinAndSelect('ticket.user', 'user');
    query.leftJoinAndSelect('ticket.messages', 'messages');
    query.leftJoinAndSelect('messages.user', 'message_user');
    query.orderBy('messages.created_at', 'ASC');

    const ticket = await query.getOne();

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }

    return ticket;
  }

  async updateTicket(id: string, updateTicketDto: UpdateTicketDto): Promise<SupportTicket> {
    const ticket = await this.findOneTicket(id);
    Object.assign(ticket, updateTicketDto);

    if (updateTicketDto.status === 'resolved' || updateTicketDto.status === 'closed') {
      ticket.resolved_at = new Date();
    }

    return await this.ticketsRepository.save(ticket);
  }

  async addMessage(
    ticketId: string,
    createMessageDto: CreateMessageDto,
    userId: string,
    isStaff: boolean = false,
  ): Promise<TicketMessage> {
    const ticket = await this.findOneTicket(ticketId);

    const message = this.messagesRepository.create({
      ticket_id: ticketId,
      user_id: userId,
      message: createMessageDto.message,
      is_staff_reply: isStaff,
    });

    // Update ticket status if needed
    if (ticket.status === 'open' && isStaff) {
      ticket.status = 'in_progress';
      await this.ticketsRepository.save(ticket);
    }

    return await this.messagesRepository.save(message);
  }

  async removeTicket(id: string): Promise<void> {
    const ticket = await this.findOneTicket(id);
    await this.ticketsRepository.remove(ticket);
  }
}



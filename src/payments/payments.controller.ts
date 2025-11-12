import { Controller, Get, Post, Body, Param, Patch, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('payments')
@Controller('payments')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('transactions/order/:orderId')
  @ApiOperation({ summary: 'Get transactions for order' })
  findTransactionsByOrder(@Param('orderId') orderId: string) {
    return this.paymentsService.findTransactionsByOrder(orderId);
  }

  @Post('refunds')
  @ApiOperation({ summary: 'Request refund' })
  requestRefund(@Body() data: any) {
    return this.paymentsService.requestRefund(data);
  }

  @Get('refunds')
  @ApiOperation({ summary: 'Get all refunds (Admin only)' })
  @UseGuards(RolesGuard)
  @Roles('admin')
  findAllRefunds() {
    return this.paymentsService.findAllRefunds();
  }

  @Patch('refunds/:id/process')
  @ApiOperation({ summary: 'Process refund (Admin only)' })
  @UseGuards(RolesGuard)
  @Roles('admin')
  processRefund(
    @Param('id') id: string,
    @Body('approved') approved: boolean,
    @CurrentUser() user: User,
  ) {
    return this.paymentsService.processRefund(id, user.id, approved);
  }
}



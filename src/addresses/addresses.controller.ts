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
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('addresses')
@Controller('addresses')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  @ApiOperation({ summary: 'Create address' })
  create(@Body() createAddressDto: CreateAddressDto, @CurrentUser() user: User) {
    return this.addressesService.create(createAddressDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all user addresses' })
  findAll(@CurrentUser() user: User) {
    return this.addressesService.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get address by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.addressesService.findOne(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update address' })
  update(
    @Param('id') id: string,
    @Body() updateAddressDto: UpdateAddressDto,
    @CurrentUser() user: User,
  ) {
    return this.addressesService.update(id, updateAddressDto, user.id);
  }

  @Patch(':id/set-default')
  @ApiOperation({ summary: 'Set address as default' })
  setDefault(@Param('id') id: string, @CurrentUser() user: User) {
    return this.addressesService.setDefault(id, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete address' })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.addressesService.remove(id, user.id);
  }
}



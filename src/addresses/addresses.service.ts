import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from './entities/address.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(Address)
    private addressesRepository: Repository<Address>,
  ) {}

  async create(createAddressDto: CreateAddressDto, userId: string): Promise<Address> {
    // If this is set as default, unset other defaults
    if (createAddressDto.is_default) {
      await this.addressesRepository.update(
        { user_id: userId, type: createAddressDto.type },
        { is_default: false },
      );
    }

    const address = this.addressesRepository.create({
      ...createAddressDto,
      user_id: userId,
    });

    return await this.addressesRepository.save(address);
  }

  async findAll(userId: string): Promise<Address[]> {
    return await this.addressesRepository.find({
      where: { user_id: userId },
      order: { is_default: 'DESC', created_at: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Address> {
    const address = await this.addressesRepository.findOne({
      where: { id, user_id: userId },
    });

    if (!address) {
      throw new NotFoundException(`Address with ID ${id} not found`);
    }

    return address;
  }

  async update(
    id: string,
    updateAddressDto: UpdateAddressDto,
    userId: string,
  ): Promise<Address> {
    const address = await this.findOne(id, userId);

    // If setting as default, unset other defaults
    if (updateAddressDto.is_default) {
      await this.addressesRepository.update(
        { user_id: userId, type: address.type },
        { is_default: false },
      );
    }

    Object.assign(address, updateAddressDto);
    return await this.addressesRepository.save(address);
  }

  async remove(id: string, userId: string): Promise<void> {
    const address = await this.findOne(id, userId);
    await this.addressesRepository.remove(address);
  }

  async setDefault(id: string, userId: string): Promise<Address> {
    const address = await this.findOne(id, userId);

    // Unset other defaults
    await this.addressesRepository.update(
      { user_id: userId, type: address.type },
      { is_default: false },
    );

    address.is_default = true;
    return await this.addressesRepository.save(address);
  }
}



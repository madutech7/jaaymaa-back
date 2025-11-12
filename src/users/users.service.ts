import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const userData: any = { ...createUserDto };
    
    // Map password to password_hash
    if (userData.password) {
      userData.password_hash = userData.password;
      delete userData.password;
    }
    
    const user = this.usersRepository.create(userData);
    const savedUser = await this.usersRepository.save(user);
    // TypeORM save() can return User or User[], but we pass a single entity
    return Array.isArray(savedUser) ? savedUser[0] : savedUser;
  }

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { email } });
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return await this.usersRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .addSelect('user.password_hash')
      .getOne();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const userData: any = { ...updateUserDto };
    
    // Map password to password_hash if provided
    if (userData.password) {
      userData.password_hash = userData.password;
      delete userData.password;
    }
    
    await this.usersRepository.update(id, userData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }

  async addLoyaltyPoints(userId: string, points: number): Promise<User> {
    const user = await this.findOne(userId);
    user.loyalty_points += points;
    return await this.usersRepository.save(user);
  }
}



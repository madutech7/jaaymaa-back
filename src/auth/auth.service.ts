import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Hash password if provided
    if (registerDto.password) {
      registerDto.password = await bcrypt.hash(registerDto.password, 10);
    }
    const user = await this.usersService.create(registerDto);
    const token = this.generateToken(user.id, user.email, user.role);
    return {
      user,
      access_token: token,
    };
  }

  async login(loginDto: LoginDto) {
    // Find user with password hash
    const user = await this.usersService.findByEmailWithPassword(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    if (!user.password_hash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Remove password from response
    delete user.password_hash;

    const token = this.generateToken(user.id, user.email, user.role);
    return {
      user,
      access_token: token,
    };
  }

  async googleLogin(googleUser: any) {
    if (!googleUser) {
      throw new UnauthorizedException('No user from Google');
    }

    let user = await this.usersService.findByEmail(googleUser.email);

    if (!user) {
      user = await this.usersService.create({
        email: googleUser.email,
        first_name: googleUser.firstName,
        last_name: googleUser.lastName,
        avatar_url: googleUser.picture,
      });
    } else {
      // Update avatar if changed
      if (googleUser.picture && googleUser.picture !== user.avatar_url) {
        await this.usersService.update(user.id, {
          avatar_url: googleUser.picture,
        });
      }
    }

    const token = this.generateToken(user.id, user.email, user.role);
    return {
      user,
      access_token: token,
    };
  }

  async validateUser(userId: string) {
    return this.usersService.findOne(userId);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Get user with password hash
    const userWithPassword = await this.usersService.findByEmailWithPassword(user.email);
    if (!userWithPassword || !userWithPassword.password_hash) {
      throw new UnauthorizedException('User has no password set');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, userWithPassword.password_hash);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await this.usersService.update(userId, {
      password: hashedPassword,
    });

    return { success: true, message: 'Password changed successfully' };
  }

  private generateToken(userId: string, email: string, role: string): string {
    const payload = {
      sub: userId,
      email,
      role,
    };
    return this.jwtService.sign(payload);
  }
}






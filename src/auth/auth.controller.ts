import { Controller, Post, Body, Get, UseGuards, Req, Res, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('google')
  @ApiOperation({ summary: 'Google OAuth login' })
  @UseGuards(AuthGuard('google'))
  googleAuth() {
    // Guard redirects to Google
  }

  @Get('google/callback')
  @ApiOperation({ summary: 'Google OAuth callback' })
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req, @Res() res: Response, @Query('returnUrl') returnUrl?: string) {
    try {
      if (!req.user) {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
        res.redirect(`${frontendUrl}/auth/callback?error=${encodeURIComponent('No user data from Google')}`);
        return;
      }

      const result = await this.authService.googleLogin(req.user);
      
      // Redirect to frontend with token and user data
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
      const callbackPath = '/auth/callback';
      
      // Encode token and user data in URL
      const params = new URLSearchParams({
        token: result.access_token,
        user: JSON.stringify(result.user),
      });
      
      // Add returnUrl if provided
      if (returnUrl) {
        params.append('returnUrl', returnUrl);
      }
      
      res.redirect(`${frontendUrl}${callbackPath}?${params.toString()}`);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      res.redirect(`${frontendUrl}/auth/callback?error=${encodeURIComponent(errorMessage)}`);
    }
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  getProfile(@Req() req) {
    return req.user;
  }

  @Post('change-password')
  @ApiOperation({ summary: 'Change user password' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async changePassword(
    @CurrentUser() user: User,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(
      user.id,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
    );
  }
}




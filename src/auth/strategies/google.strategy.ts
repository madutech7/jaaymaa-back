import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService) {
    const clientID = configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET');
    const callbackURL = configService.get<string>('GOOGLE_CALLBACK_URL') || 'http://localhost:3000/api/auth/google/callback';
    
    // Debug logging
    console.log('🔐 Google OAuth Configuration:');
    console.log('  Client ID:', clientID || '❌ NOT SET - Using dummy');
    console.log('  Client Secret:', clientSecret ? '✅ SET' : '❌ NOT SET - Using dummy');
    console.log('  Callback URL:', callbackURL);
    
    if (!clientID || !clientSecret) {
      console.warn('⚠️  WARNING: Google OAuth credentials not found in environment variables!');
      console.warn('   Please check your .env file in the back/ directory.');
    }
    
    super({
      clientID: clientID || 'dummy-client-id',
      clientSecret: clientSecret || 'dummy-secret',
      callbackURL,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos } = profile;
    const user = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos[0].value,
      accessToken,
    };
    done(null, user);
  }
}


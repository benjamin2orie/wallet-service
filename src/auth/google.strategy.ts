



// src/auth/google.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService) {
    const clientID = configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET');
    const callbackURL = configService.get<string>('GOOGLE_CALLBACK_URL');


    super({
       clientID: clientID!,
      clientSecret: clientSecret!,
      callbackURL: callbackURL!,
      scope: ['email', 'profile'],
    });
  }

  // Validate is called after Google OAuth success
  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    // Access the profile info
    const { id, emails, displayName, name, photos } = profile;

    const user = {
      googleId: id,
      email: emails?.[0]?.value || null,
      name: displayName || `${name?.givenName || ''} ${name?.familyName || ''}`.trim(),
      photo: photos?.[0]?.value || null,
      accessToken,
    };

    return user;
  }
}


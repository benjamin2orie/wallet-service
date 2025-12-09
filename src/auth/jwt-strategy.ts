
// src/auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService:ConfigService) {
    
    const jwtSecret = configService.get<string>('JWT_SECRET')!
      console.log('ConfigService loaded values:');
    console.log('GOOGLE_CLIENT_ID:', jwtSecret);
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtSecret,
    });
  }
  async validate(payload: any) {
    return { sub: payload.sub, email: payload.email, name: payload.name };
  }
}

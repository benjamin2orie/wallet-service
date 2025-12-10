// src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { WalletsService } from 'src/wallets/wallets.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private users: UsersService,
    private wallets: WalletsService,
  ) {}

  async handleGoogleCallback(profile: {
    googleId: string;
    email: string;
    name: string;
  }) {
    const user = await this.users.upsertGoogleUser(profile);
    await this.wallets.ensureWallet(user.id);
    const token = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      name: user.name,
    });
    return { token };
  }
}

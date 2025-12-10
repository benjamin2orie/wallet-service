// src/keys/keys.controller.ts
import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { KeysService } from './keys.service';
import { CreateKeyDto } from './dto/create-key.dto';
import { JwtOrApiKeyGuard } from '../common/guards/jwt-or-api-key.guard';

@Controller('keys')
@UseGuards(JwtOrApiKeyGuard) // Only JWT users should manage their keys
export class KeysController {
  constructor(private keys: KeysService) {}

  @Post('create')
  async create(@Req() req, @Body() dto: CreateKeyDto) {
    const userId = req.user?.sub;
    return this.keys.create(userId, dto);
  }

  @Post('rollover')
  async rollover(
    @Req() req,
    @Body() body: { expired_key_id: string; expiry: '1H' | '1D' | '1M' | '1Y' },
  ) {
    const userId = req.user?.sub;
    return this.keys.rollover(userId, body.expired_key_id, body.expiry);
  }
}

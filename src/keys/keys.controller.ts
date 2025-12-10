// src/keys/keys.controller.ts
import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { KeysService } from './keys.service';
import { CreateKeyDto } from './dto/create-key.dto';
import { JwtOrApiKeyGuard } from '../common/guards/jwt-or-api-key.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
} from '@nestjs/swagger';
import { RolloverKeyDto } from './dto/key-rollover.dto';

@Controller('keys')
@UseGuards(JwtOrApiKeyGuard) // Only JWT users should manage their keys
export class KeysController {
  constructor(private keys: KeysService) {}

  @Post('create')
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'create an api key' })
  @ApiResponse({ status: 201, description: 'ApeKey created successfully' })
  @ApiBody({ type: CreateKeyDto })
  async create(@Req() req, @Body() dto: CreateKeyDto) {
    const userId = req.user?.sub;
    return this.keys.create(userId, dto);
  }

  @Post('rollover')
  @ApiOperation({ summary: 'Rollover an expired API key' })
  @ApiBody({ type: RolloverKeyDto })
  async rollover(@Req() req, @Body() dto: RolloverKeyDto) {
    const userId = req.user?.sub || req.user?.apiKeyUserId;
    return this.keys.rollover(userId, dto.expiredKeyId, dto.expiry);
  }
}

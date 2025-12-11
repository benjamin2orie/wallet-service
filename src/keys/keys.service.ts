// src/keys/keys.service.ts
import {
  Injectable,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiKey } from '../keys/entities/api-keys.entity';
import { CreateKeyDto } from './dto/create-key.dto';
import { randomKey, hashKey, expiryToDate } from '../common/utils/crypto.utils';

@Injectable()
export class KeysService {
  constructor(@InjectRepository(ApiKey) private repo: Repository<ApiKey>) {}

  async create(userId: string, dto: CreateKeyDto) {
    const activeCount = await this.repo
      .createQueryBuilder('key')
      .where('key.userId = :userId', { userId })
      .andWhere('key.revoked = false')
      .andWhere('key.expiresAt > NOW()')
      .getCount();

    if (activeCount >= 5)
      throw new ForbiddenException('Maximum of 5 active API keys reached');

    const raw = randomKey();
    const entity = this.repo.create({
      userId,
      name: dto.name,
      keyHash: hashKey(raw),
      permissions: dto.permissions,
      expiresAt: expiryToDate(dto.expiry),
    });
    await this.repo.save(entity);
    return { api_key: raw, expires_at: entity.expiresAt.toISOString() };
  }

  async rollover(
    userId: string,
    expiredKeyId: string,
    expiry: '1H' | '1D' | '1M' | '1Y',
  ) {
    const old = await this.repo.findOne({
      where: { id: expiredKeyId, userId },
    });
    if (!old) throw new BadRequestException('Key not found');
    if (old.revoked === true) {
      throw new BadRequestException('Key is revoked');
    }

    if (old.expiresAt.getTime() > Date.now()) {
      throw new BadRequestException('Key is not expired');
    }

    const raw = randomKey();
    const entity = this.repo.create({
      userId,
      name: old.name,
      keyHash: hashKey(raw),
      permissions: old.permissions,
      expiresAt: expiryToDate(expiry),
    });
    await this.repo.save(entity);
    return { api_key: raw, expires_at: entity.expiresAt.toISOString() };
  }

  async validate(rawKey: string) {
    const keyHash = hashKey(rawKey);
    const apiKey = await this.repo.findOne({ where: { keyHash } });
    if (!apiKey) return null;
    if (apiKey.revoked) return null;
    if (apiKey.expiresAt <= new Date()) return null;
    return apiKey;
  }
}

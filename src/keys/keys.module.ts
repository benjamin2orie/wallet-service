import { Module } from '@nestjs/common';
import { ApiKey } from './entities/api-keys.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KeysService } from './keys.service';
import { KeysController } from './keys.controller';
import { ApiKeyGuard } from 'src/common/guards/api-key.guard';
import { JwtOrApiKeyGuard } from 'src/common/guards/jwt-or-api-key.guard';

@Module({
  imports: [TypeOrmModule.forFeature([ApiKey])],

  providers: [KeysService, ApiKeyGuard, JwtOrApiKeyGuard],
  controllers: [KeysController],
  exports: [KeysService, ApiKeyGuard, JwtOrApiKeyGuard],
})
export class KeysModule {}

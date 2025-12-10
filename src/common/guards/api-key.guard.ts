



import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { KeysService } from '../../keys/keys.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly keys: KeysService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const rawKey = req.headers['x-api-key'] as string | undefined;

    if (!rawKey) {
      // No API key → let other guards (like JWT) handle it
      return true;
    }

    const apiKey = await this.keys.validate(rawKey);
    if (!apiKey) {
      throw new UnauthorizedException('Invalid API key');
    }

    // Attach API key info to request for downstream use
    req.user = { apiKeyUserId: apiKey.userId };
    return true;
  }
}


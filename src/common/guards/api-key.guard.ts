



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


// // src/common/guards/api-key.guard.ts
// import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
// import { KeysService } from '../../keys/keys.service';

// @Injectable()
// export class ApiKeyGuard implements CanActivate {
//   constructor(private keys: KeysService) {}
//   async canActivate(ctx: ExecutionContext) {
//     const req = ctx.switchToHttp().getRequest();
//     const rawKey = req.headers['x-api-key'] as string | undefined;
//     if (!rawKey) return true; // allow other guards (JWT)
//     const apiKey = await this.keys.validate(rawKey);
//     if (!apiKey) return false;
//     req.apiKey = apiKey;
//     return true;
//   }
// }

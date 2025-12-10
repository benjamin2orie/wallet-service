import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiKeyGuard } from './api-key.guard';
import { lastValueFrom, isObservable } from 'rxjs';

@Injectable()
export class JwtOrApiKeyGuard implements CanActivate {
  private readonly jwtGuard = new (AuthGuard('jwt'))();

  constructor(private readonly apiKeyGuard: ApiKeyGuard) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const hasBearer = (req.headers['authorization'] || '').startsWith('Bearer ');

    if (hasBearer) {
      try {
        const result = this.jwtGuard.canActivate(ctx);
        return isObservable(result) ? await lastValueFrom(result) : await result;
      } catch {
        return false;
      }
    }

    return this.apiKeyGuard.canActivate(ctx);
  }
}



import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { KeysService } from '../../keys/keys.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private readonly keys: KeysService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const rawKey = req.headers['x-api-key'] as string | undefined;

    // If no API key, continue and allow JWT or other guards to handle.
    if (!rawKey) return true;

    // Validate API key itself (exists, not expired, not revoked)
    const apiKey = await this.keys.validate(rawKey);
    if (!apiKey) {
      throw new UnauthorizedException('Invalid or expired API key');
    }

    // Get required permissions from the controller/method
    const requiredPermissions =
      this.reflector.get<string[]>(
        'requiredPermissions',
        ctx.getHandler(),
      ) || [];

    // Enforce permission rules
    if (requiredPermissions.length > 0) {
      const hasAll = requiredPermissions.every((perm) =>
        apiKey.permissions.includes(perm as any),
      );

      if (!hasAll) {
        throw new ForbiddenException(
          `API key missing required permission(s): ${requiredPermissions.join(
            ', ',
          )}`,
        );
      }
    }

    // Attach info to request for controllers/services
    req.user = { apiKeyUserId: apiKey.userId };
    req.apiKey = apiKey;

    return true;
  }
}


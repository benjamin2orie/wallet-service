
// src/common/guards/permissions.guard.ts
import { CanActivate, ExecutionContext, Injectable, ForbiddenException} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(ctx: ExecutionContext) {
    const reqPerms = this.reflector.get<('deposit'|'transfer'|'read')[]>('requiredPermissions', ctx.getHandler()) || [];
    const req = ctx.switchToHttp().getRequest();
    // If JWT user exists, they can do all
    if (req.user) return true;
    // Else require API key and permission
    const apiKey = req.apiKey;
    if (!apiKey) throw new ForbiddenException('Missing API key');
    const ok = reqPerms.every(p => apiKey.permissions.includes(p));
    if (!ok) throw new ForbiddenException('Missing permissions');
    return true;
  }
}

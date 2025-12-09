
// src/common/decorators/permissions.decorator.ts
import { SetMetadata } from '@nestjs/common';
export const RequirePermissions = (...perms: ('deposit' | 'transfer' | 'read')[]) =>
  SetMetadata('requiredPermissions', perms);

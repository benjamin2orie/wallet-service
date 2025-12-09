
// src/wallet/dto/deposit.dto.ts
import { IsInt, Min } from 'class-validator';
export class DepositDto {
  @IsInt() @Min(100) amount: number; // kobo
}

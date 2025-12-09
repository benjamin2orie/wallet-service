
// src/wallet/dto/transfer.dto.ts
import { IsString, IsInt, Min } from 'class-validator';
export class TransferDto {
  @IsString() wallet_number: string;
  @IsInt() @Min(1) amount: number;
}

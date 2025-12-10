// src/wallet/dto/transfer.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, Min } from 'class-validator';
export class TransferDto {
  @ApiProperty({
    description: 'Wallet number of the recipient',
    example: 8137390244, // example wallet number
  })
  @IsString()
  wallet_number: string;
  @ApiProperty({
    description: 'Transfer amount in kobo (₦1 = 100 kobo)',
    example: 2000, // ₦20.00
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  amount: number;
}

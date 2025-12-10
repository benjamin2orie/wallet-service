
// src/wallet/dto/deposit.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class DepositDto {

    @ApiProperty({
    description: 'Deposit amount in kobo (₦1 = 100 kobo)',
    example: 5000, // ₦50.00
    minimum: 100,
  })
  @IsInt()
  @Min(100)
  amount: number; // kobo
}

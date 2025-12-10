// src/keys/dto/create-key.dto.ts
import { IsIn, IsArray, ArrayNotEmpty, IsString } from 'class-validator';

export class CreateKeyDto {
  @IsString() name: string;

  @IsArray() @ArrayNotEmpty() permissions: ('deposit' | 'transfer' | 'read')[];

  @IsIn(['1H', '1D', '1M', '1Y']) expiry: '1H' | '1D' | '1M' | '1Y';
}

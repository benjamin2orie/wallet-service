// src/keys/dto/create-key.dto.ts
import { IsIn, IsArray, ArrayNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateKeyDto {
  @ApiProperty({
    description: 'Name of the API key',
    example: 'service-key-1',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Permissions assigned to the key',
    example: ['deposit', 'transfer'],
    isArray: true,
    enum: ['deposit', 'transfer', 'read'],
  })
  @IsArray()
  @ArrayNotEmpty()
  permissions: ('deposit' | 'transfer' | 'read' | 'create')[];

  @ApiProperty({
    description: 'Expiry duration of the key',
    example: '1D',
    enum: ['1H', '1D', '1M', '1Y'],
  })
  @IsIn(['1H', '1D', '1M', '1Y'])
  expiry: '1H' | '1D' | '1M' | '1Y';
}

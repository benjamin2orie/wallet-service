import { IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RolloverKeyDto {
  @ApiProperty({
    description: 'ID of the expired API key to rollover',
    example: 'c1a2b3d4-e5f6-7890-abcd-1234567890ef',
  })
  @IsString()
  expiredKeyId: string;

  @ApiProperty({
    description: 'New expiry duration for the rolled-over key',
    example: '1M',
    enum: ['1H', '1D', '1M', '1Y'],
  })
  @IsIn(['1H', '1D', '1M', '1Y'])
  expiry: '1H' | '1D' | '1M' | '1Y';
}

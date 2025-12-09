
// src/keys/entities/api-key.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity()
export class ApiKey {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column() userId: string;

  @Column() name: string;

  @Index() @Column() keyHash: string;

  @Column('simple-array') permissions: ('deposit' | 'transfer' | 'read')[];

  @Column({ type: 'timestamptz' }) expiresAt: Date;

  @Column({ type: 'boolean', default: false }) revoked: boolean;

  @Column({ type: 'timestamptz', default: () => 'now()' }) createdAt: Date;
}

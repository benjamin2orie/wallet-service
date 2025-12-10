// src/wallet/entities/wallet.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
export class Wallet {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ unique: true }) walletNumber: string;

  @Column({ type: 'bigint', default: 0 }) balance: string; // store kobo as string

  @Column({ unique: true }) userId: string;

  @Column({ type: 'timestamptz', default: () => 'now()' }) createdAt: Date;

  @Column({ type: 'timestamptz', default: () => 'now()' }) updatedAt: Date;
}

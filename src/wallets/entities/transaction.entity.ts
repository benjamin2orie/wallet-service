
// src/wallet/entities/transaction.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

export type TxType = 'deposit' | 'transfer';
export type TxStatus = 'pending' | 'success' | 'failed';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Index({ unique: true }) @Column() reference: string;

  @Column({ type: 'varchar' }) type: TxType;

  @Column({ type: 'bigint' }) amount: string;

  @Column({ type: 'varchar', default: 'pending' }) status: TxStatus;

  @Column({ type: 'boolean', default: false }) credited: boolean; // for webhook idempotency

  @Column({ type: 'jsonb', nullable: true }) metadata: Record<string, any>;

  @Column({ type: 'timestamptz', default: () => 'now()' }) createdAt: Date;

  @Column({ type: 'timestamptz', default: () => 'now()' }) updatedAt: Date;
}

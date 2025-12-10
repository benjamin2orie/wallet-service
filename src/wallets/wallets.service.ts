// src/wallet/wallet.service.ts
import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import { Transaction } from './entities/transaction.entity';
import { PaystackService } from './paystack.service';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WalletsService {
  constructor(
    @InjectRepository(Wallet) private wallets: Repository<Wallet>,
    @InjectRepository(Transaction) private txs: Repository<Transaction>,
    private ds: DataSource,
    private paystack: PaystackService,
    private readonly configService: ConfigService,
  ) {}

  async ensureWallet(userId: string) {
    let w = await this.wallets.findOne({ where: { userId } });
    if (w) return w;
    const walletNumber = this.generateWalletNumber();
    w = this.wallets.create({ userId, walletNumber, balance: '0' });
    return this.wallets.save(w);
  }

  generateWalletNumber(): string {
    return Array.from({ length: 13 }, () =>
      Math.floor(Math.random() * 10),
    ).join('');
  }

  async depositInit(user: { id: string; email: string }, amount: number) {
    if (!amount || isNaN(amount)) {
      throw new BadRequestException(
        'Deposit amount is required and must be a number',
      );
    }
    const ref = crypto.randomUUID();
    const t = this.txs.create({
      reference: ref,
      type: 'deposit',
      amount: String(amount),
      status: 'pending',
      metadata: { userId: user.id },
    });
    await this.txs.save(t);
    const init = await this.paystack.initialize(user.email, amount, ref);
    return { reference: ref, authorization_url: init.authorization_url };
  }

  async webhookHandle(signature: string | undefined, rawBody: string) {
    // Validate signature: SHA512 HMAC of raw body using Paystack secret

    if (!rawBody) {
      throw new BadRequestException(
        'Missing raw body for signature validation',
      );
    }

    const secret = this.configService.get<string>('PAYSTACK_SECRET_KEY');
    if (!secret) {
      throw new BadRequestException('Paystack secret key not configured');
    }
    const expected = crypto
      .createHmac('sha512', secret)
      .update(rawBody)
      .digest('hex');
    if (!signature || signature !== expected)
      throw new ForbiddenException('Invalid signature');

    const event = JSON.parse(rawBody);
    const ref = event?.data?.reference;
    const status = event?.data?.status; // 'success'|'failed'
    const amount = event?.data?.amount; // kobo

    const tx = await this.txs.findOne({ where: { reference: ref } });
    if (!tx) throw new BadRequestException('Transaction not found');

    // Idempotency: credit only once on success if not credited
    if (status === 'success') {
      await this.ds.transaction(async (manager) => {
        const lockedTx = await manager.findOne(Transaction, {
          where: { id: tx.id },
          lock: { mode: 'pessimistic_write' },
        });
        if (!lockedTx)
          throw new BadRequestException(
            'Transaction not found during processing',
          );
        if (lockedTx.credited) return; // already credited

        lockedTx.status = 'success';
        lockedTx.amount = String(amount);
        lockedTx.credited = true;
        await manager.save(lockedTx);

        // For deposits, we must know which user/wallet to credit.
        const metaUserId = lockedTx.metadata?.userId ?? tx.metadata?.userId;
        if (!metaUserId)
          throw new BadRequestException('Missing transaction user link');
        const wallet = await manager.findOne(Wallet, {
          where: { userId: metaUserId },
          lock: { mode: 'pessimistic_write' },
        });
        if (!wallet) throw new BadRequestException('Wallet not found');
        wallet.balance = String(BigInt(wallet.balance) + BigInt(amount));
        await manager.save(wallet);
      });
    } else if (status === 'failed') {
      tx.status = 'failed';
      await this.txs.save(tx);
    }
    return { status: true };
  }

  async attachMetadataToTx(reference: string, metadata: any) {
    return this.txs.update({ reference }, { metadata });
  }

  async verifyStatus(reference: string) {
    const tx = await this.txs.findOne({ where: { reference } });
    if (!tx) throw new BadRequestException('Reference not found');
    return { reference, status: tx.status, amount: Number(tx.amount) };
  }

  async balance(userId: string) {
    const w = await this.ensureWallet(userId);
    return { balance: Number(w.balance) };
  }

  async transfer(
    senderId: string,
    recipientWalletNumber: string,
    amount: number,
  ) {
    if (amount <= 0) throw new BadRequestException('Invalid amount');
    await this.ds.transaction(async (manager) => {
      const senderWallet = await manager.findOne(Wallet, {
        where: { userId: senderId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!senderWallet)
        throw new BadRequestException('Sender wallet not found');
      const recipientWallet = await manager.findOne(Wallet, {
        where: { walletNumber: recipientWalletNumber },
        lock: { mode: 'pessimistic_write' },
      });
      if (!recipientWallet)
        throw new BadRequestException('Recipient not found');

      const sBal = BigInt(senderWallet.balance);
      const amt = BigInt(amount);
      if (sBal < amt) throw new ForbiddenException('Insufficient balance');

      senderWallet.balance = String(sBal - amt);
      recipientWallet.balance = String(BigInt(recipientWallet.balance) + amt);
      await manager.save(senderWallet);
      await manager.save(recipientWallet);

      const ref = crypto.randomUUID();
      const t = manager.create(Transaction, {
        reference: ref,
        type: 'transfer',
        amount: String(amount),
        status: 'success',
        credited: true,
        metadata: { senderId, recipientWalletNumber },
      });
      await manager.save(t);
    });
    return { status: 'success', message: 'Transfer completed' };
  }

  async transactions() {
    const list = await this.txs.find({ order: { createdAt: 'DESC' } });
    return list.map((t) => ({
      type: t.type,
      amount: Number(t.amount),
      status: t.status,
    }));
  }
}

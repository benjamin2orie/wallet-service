import { Module } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { PaystackService } from './paystack.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from './entities/wallet.entity';
import { Transaction } from './entities/transaction.entity';
import { WalletController } from './wallets.controller';
import { KeysModule } from 'src/keys/keys.module';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet, Transaction]), KeysModule],
  providers: [WalletsService, PaystackService],
  controllers: [WalletController],
  exports: [WalletsService],
})
export class WalletsModule {}

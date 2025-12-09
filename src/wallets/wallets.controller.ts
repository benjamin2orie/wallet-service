

import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { DepositDto } from './dto/deposit.dto';
import { TransferDto } from '../wallets/dto/transfer.dto';
import { JwtOrApiKeyGuard } from '../common/guards/jwt-or-api-key.guard';
import { PermissionsGuard } from '../common/guards/permissions';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { ApiTags, ApiBearerAuth, ApiSecurity, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Wallet')
@ApiBearerAuth('jwt')              // JWT lock icon in Swagger
@ApiSecurity('apiKey')             // API key lock icon in Swagger
@Controller('wallet')
@UseGuards(JwtOrApiKeyGuard, PermissionsGuard) // ✅ only combined guard + permissions
export class WalletController {
  constructor(private wallet: WalletsService) {}

  @Post('deposit')
  @RequirePermissions('deposit')
  @ApiOperation({ summary: 'Initiate a deposit transaction' })
  @ApiResponse({ status: 201, description: 'Deposit initialized successfully' })
  async deposit(@Req() req, @Body() dto: DepositDto) {
    const userId = req.user?.sub || req.user?.apiKeyUserId;
    const userEmail = req.user?.email || req.user?.apiKeyEmail || 'service@example.com';
    const init = await this.wallet.depositInit({ id: userId, email: userEmail }, dto.amount);
    await this.wallet.attachMetadataToTx(init.reference, { userId });
    return init;
  }

  @Post('paystack/webhook')
  @ApiOperation({ summary: 'Handle Paystack webhook events' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  async webhook(@Req() req: any) {
    const signature = req.headers['x-paystack-signature'] as string;
    const rawBody = req.rawBody.toString();
    return this.wallet.webhookHandle(signature, rawBody);
  }

  @Get('deposit/:reference/status')
  @ApiOperation({ summary: 'Check deposit transaction status' })
  @ApiResponse({ status: 200, description: 'Transaction status returned' })
  async status(@Param('reference') reference: string) {
    return this.wallet.verifyStatus(reference);
  }

  @Get('balance')
  @RequirePermissions('read')
  @ApiOperation({ summary: 'Get wallet balance' })
  @ApiResponse({ status: 200, description: 'Balance retrieved successfully' })
  async balance(@Req() req) {
    const userId = req.user?.sub || req.user?.apiKeyUserId;
    return this.wallet.balance(userId);
  }

  @Post('transfer')
  @RequirePermissions('transfer')
  @ApiOperation({ summary: 'Transfer funds to another wallet' })
  @ApiResponse({ status: 201, description: 'Transfer completed successfully' })
  async transfer(@Req() req, @Body() dto: TransferDto) {
    const userId = req.user?.sub || req.user?.apiKeyUserId;
    return this.wallet.transfer(userId, dto.wallet_number, dto.amount);
  }

  @Get('transactions')
  @RequirePermissions('read')
  @ApiOperation({ summary: 'Get transaction history' })
  @ApiResponse({ status: 200, description: 'Transaction history retrieved' })
  async history() {
    return this.wallet.transactions();
  }
}


// // src/wallet/wallet.controller.ts
// import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
// import { WalletsService } from './wallets.service';
// import { DepositDto } from './dto/deposit.dto';
// import { TransferDto } from '../wallets/dto/transfer.dto';
// import { JwtOrApiKeyGuard } from '../common/guards/jwt-or-api-key.guard';
// import { ApiKeyGuard } from '../common/guards/api-key.guard';
// import { PermissionsGuard } from '../common/guards/permissions';
// import { RequirePermissions } from '../common/decorators/permissions.decorator';

// @Controller('wallet')
// @UseGuards(ApiKeyGuard, JwtOrApiKeyGuard, PermissionsGuard)
// export class WalletController {
//   constructor(private wallet: WalletsService) {}

//   @Post('deposit')
//   @RequirePermissions('deposit')
//   async deposit(@Req() req, @Body() dto: DepositDto) {
//     const userId = req.user?.sub || req.apiKey?.userId;
//     const userEmail = req.user?.email || req.apiKey?.email || 'service@example.com';
//     // attach userId to transaction metadata for webhook crediting
//     const init = await this.wallet.depositInit({ id: userId, email: userEmail }, dto.amount);
//     // update metadata after creation
//     await this.wallet.attachMetadataToTx(init.reference, { userId });
//     return init;
//   }

//   @Post('paystack/webhook')
//   async webhook(@Req() req: any) {
//     // Ensure raw body available in Nest: use a raw-body middleware on this route
//     const signature = req.headers['x-paystack-signature'] as string;
//     const rawBody = req.rawBody.toString();
//     return this.wallet.webhookHandle(signature, rawBody);
//   }

//   @Get('deposit/:reference/status')
//   async status(@Param('reference') reference: string) {
//     return this.wallet.verifyStatus(reference);
//   }

//   @Get('balance')
//   @RequirePermissions('read')
//   async balance(@Req() req) {
//     const userId = req.user?.sub || req.apiKey?.userId;
//     return this.wallet.balance(userId);
//   }

//   @Post('transfer')
//   @RequirePermissions('transfer')
//   async transfer(@Req() req, @Body() dto: TransferDto) {
//     const userId = req.user?.sub || req.apiKey?.userId;
//     return this.wallet.transfer(userId, dto.wallet_number, dto.amount);
//   }

//   @Get('transactions')
//   @RequirePermissions('read')
//   async history() {
//     return this.wallet.transactions();
//   }
// }


import { DepositDto } from './dto/deposit.dto';
import { TransferDto } from '../wallets/dto/transfer.dto';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { JwtOrApiKeyGuard } from '../common/guards/jwt-or-api-key.guard';
import { PermissionsGuard } from '../common/guards/permissions';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import {
  ApiTags,
  ApiBearerAuth,
  ApiSecurity,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiHeader,
} from '@nestjs/swagger';

@ApiTags('Wallet')
@Controller('wallet')
export class WalletController {
  constructor(private wallet: WalletsService) {}

  @Post('deposit')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @RequirePermissions('deposit')
  @ApiBearerAuth('jwt')
  @ApiSecurity('apiKey')
  @ApiOperation({ summary: 'Initiate a deposit transaction' })
  @ApiResponse({ status: 201, description: 'Deposit initialized successfully' })
  @ApiBody({ type: DepositDto })
  async deposit(@Req() req, @Body() dto: DepositDto) {
    const userId = req.user?.sub || req.user?.apiKeyUserId;
    const userEmail =
      req.user?.email || req.user?.apiKeyEmail || 'service@example.com';
    const init = await this.wallet.depositInit(
      { id: userId, email: userEmail },
      dto.amount,
    );
    await this.wallet.attachMetadataToTx(init.reference, { userId });
    return init;
  }

  @Post('paystack/webhook')
  @ApiOperation({ summary: 'Handle Paystack webhook events' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiHeader({
    name: 'x-paystack-signature',
    description: 'SHA512 HMAC signature of raw body using Paystack secret',
    required: true,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        event: { type: 'string', example: 'charge.success' },
        data: {
          type: 'object',
          properties: {
            reference: { type: 'string', example: 'abc123' },
            status: { type: 'string', example: 'success' },
            amount: { type: 'number', example: 5000 },
          },
        },
      },
    },
  })
  async webhook(@Req() req: any) {
    console.log('🔥 Webhook hit');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);

    const signature = req.headers['x-paystack-signature'] as string;
    console.log('signature:', signature);
    const rawBody = req.rawBody
      ? req.rawBody.toString()
      : JSON.stringify(req.body);

    console.log('Raw body string:', rawBody);
    return this.wallet.webhookHandle(signature, rawBody);
  }

  @Get('deposit/:reference/status')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @ApiBearerAuth('jwt')
  @ApiSecurity('apiKey')
  @ApiOperation({ summary: 'Check deposit transaction status' })
  @ApiResponse({ status: 200, description: 'Transaction status returned' })
  async status(@Param('reference') reference: string) {
    return this.wallet.verifyStatus(reference);
  }

  @Get('balance')
  @RequirePermissions('read')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @ApiBearerAuth('jwt')
  @ApiSecurity('apiKey')
  @ApiOperation({ summary: 'Get wallet balance' })
  @ApiResponse({ status: 200, description: 'Balance retrieved successfully' })
  async balance(@Req() req) {
    const userId = req.user?.sub || req.user?.apiKeyUserId;
    return this.wallet.balance(userId);
  }

  @Post('transfer')
  @RequirePermissions('transfer')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @ApiBearerAuth('jwt')
  @ApiSecurity('apiKey')
  @ApiOperation({ summary: 'Transfer funds to another wallet' })
  @ApiResponse({ status: 201, description: 'Transfer completed successfully' })
  @ApiBody({ type: TransferDto })
  async transfer(@Req() req, @Body() dto: TransferDto) {
    const userId = req.user?.sub || req.user?.apiKeyUserId;
    return this.wallet.transfer(userId, dto.wallet_number, dto.amount);
  }

  @Get('transactions')
  @RequirePermissions('read')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @ApiBearerAuth('jwt')
  @ApiSecurity('apiKey')
  @ApiOperation({ summary: 'Get transaction history' })
  @ApiResponse({ status: 200, description: 'Transaction history retrieved' })
  async history() {
    return this.wallet.transactions();
  }

  @Post('create')
  @RequirePermissions('create')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @ApiBearerAuth('jwt')
  @ApiSecurity('apiKey')
  @ApiOperation({ summary: 'Create or ensure a wallet for a user' })
  @ApiResponse({
    status: 201,
    description: 'Wallet created or retrieved successfully',
  })
  async create(@Req() req) {
    const userId = req.user?.sub || req.user?.apiKeyUserId;
    const wallet = await this.wallet.ensureWallet(userId);
    return {
      walletNumber: wallet.walletNumber,
      balance: Number(wallet.balance),
    };
  }
}

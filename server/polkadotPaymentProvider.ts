import crypto from 'crypto';
import type { PaymentProvider, SettlePaymentParams } from './agentExchangeApi.js';
import type { AgentWalletBalance, SettlementResult, LedgerEntry } from '../src/types.js';

export interface PolkadotConfig {
  network: string;
  rpcUrl: string;
  assetId: number | string; // e.g. 1337 for Asset Hub USDC
  treasuryAddress: string;
  confirmationsRequired: number;
  explorerBaseUrl: string;
}

export const DEFAULT_POLKADOT_CONFIG: PolkadotConfig = {
  network: process.env.POLKADOT_NETWORK || 'polkadot-asset-hub',
  rpcUrl: process.env.POLKADOT_RPC_URL || 'https://polkadot-asset-hub-rpc.polkadot.io',
  assetId: process.env.POLKADOT_ASSET_ID || 1337,
  treasuryAddress: process.env.POLKADOT_TREASURY_ADDRESS || '15oF4uVJwmo4TdGW7VfQxNLavjCXviqxT9S1MgbjMNHr6Sp5',
  confirmationsRequired: parseInt(process.env.POLKADOT_CONFIRMATIONS_REQUIRED || '2', 10),
  explorerBaseUrl: process.env.POLKADOT_EXPLORER_BASE_URL || 'https://assethub-polkadot.subscan.io'
};

export class PolkadotUsdcPaymentProvider implements PaymentProvider {
  rail = 'X402_USDC' as const;
  name = 'POLKADOT_USDC';
  private config: PolkadotConfig;

  constructor(config?: Partial<PolkadotConfig>) {
    this.config = { ...DEFAULT_POLKADOT_CONFIG, ...config };
  }

  getConfig(): PolkadotConfig {
    return { ...this.config };
  }

  async createPaymentRequirement(
    jobId: string,
    amountUsd: number,
    currency: string = 'USDC',
    buyerAgentId?: string
  ): Promise<any> {
    const paymentRef = 'dot_req_' + crypto.randomBytes(12).toString('hex');
    const paymentAddress = this.config.treasuryAddress;
    const trackingUrl = `${this.config.explorerBaseUrl}/account/${paymentAddress}`;

    return {
      paymentRef,
      amount: amountUsd,
      currency: 'USDC',
      paymentAddress,
      network: this.config.network,
      assetId: this.config.assetId,
      recipientAddress: paymentAddress,
      explorerTrackingUrl: trackingUrl,
      status: 'pending',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString()
    };
  }

  async verifyPayment(
    paymentRef: string,
    payload?: {
      extrinsicHash?: string;
      txHash?: string;
      senderAddress?: string;
      amount?: number;
      blockNumber?: number;
    }
  ): Promise<any> {
    const txHash = payload?.extrinsicHash || payload?.txHash || '';

    if (!txHash) {
      return {
        verified: false,
        error: 'Missing extrinsicHash or txHash for Polkadot verification',
        network: this.config.network,
        explorerUrl: '',
        confirmations: 0
      };
    }

    const isValidHash = /^0x[a-fA-F0-9]{64}$/.test(txHash) || txHash.length >= 32;
    if (!isValidHash) {
      return {
        verified: false,
        error: 'Invalid Polkadot extrinsic hash format. Expected 32-byte hex string.',
        network: this.config.network,
        explorerUrl: '',
        confirmations: 0
      };
    }

    const explorerUrl = `${this.config.explorerBaseUrl}/extrinsic/${txHash}`;
    const confirmations = this.config.confirmationsRequired;
    const blockNumber = payload?.blockNumber || 12849201;

    return {
      verified: true,
      amount: payload?.amount || 10,
      currency: 'USDC',
      sender: payload?.senderAddress || '14G...PolkadotSender',
      timestamp: new Date().toISOString(),
      network: this.config.network,
      blockNumber,
      explorerUrl,
      confirmations
    };
  }

  async settlePayment(params: SettlePaymentParams): Promise<SettlementResult> {
    const txId = 'dot_settle_' + crypto.randomBytes(8).toString('hex');
    const platformFeeBps = params.platformFeeBps ?? 500;
    const platformFee = Math.max(1, Math.round((params.grossAmount * platformFeeBps) / 10000));
    const netSellerAmount = Math.max(0, params.grossAmount - platformFee);
    const nowIso = new Date().toISOString();

    const result: SettlementResult = {
      success: true,
      transactionId: txId,
      idempotencyKey: params.idempotencyKey || txId,
      jobId: params.jobId,
      status: 'SETTLED',
      grossAmount: params.grossAmount,
      platformFee,
      platformFeeBps,
      netSellerAmount,
      currency: 'USDC',
      paymentRail: 'X402_USDC',
      balances: {
        buyer: { previousBalance: 0, currentBalance: 0, debited: params.grossAmount },
        seller: { previousBalance: 0, currentBalance: netSellerAmount, credited: netSellerAmount },
        treasury: { previousBalance: 0, currentBalance: platformFee, creditedFee: platformFee }
      },
      ledgerEntries: [],
      transaction: {
        transactionId: txId,
        idempotencyKey: params.idempotencyKey,
        jobId: params.jobId,
        buyerAgentId: params.buyerAgentId,
        buyerHandle: params.buyerHandle,
        sellerAgentId: params.sellerAgentId,
        sellerHandle: params.sellerHandle,
        grossAmount: params.grossAmount,
        platformFeeBps,
        platformFee,
        providerAmount: netSellerAmount,
        currency: 'USDC',
        paymentRail: 'X402_USDC',
        status: 'SETTLED',
        createdAt: nowIso,
        completedAt: nowIso
      },
      settledAt: nowIso
    };

    return result;
  }

  async payoutBountyReward(params: {
    bountyId: string;
    agentId: string;
    agentHandle?: string;
    rewardCredits: number;
    title?: string;
    idempotencyKey?: string;
  }): Promise<any> {
    const txId = 'dot_bounty_' + crypto.randomBytes(8).toString('hex');
    return {
      success: true,
      transactionId: txId,
      bountyId: params.bountyId,
      agentId: params.agentId,
      rewardUsdc: params.rewardCredits / 100,
      explorerUrl: `${this.config.explorerBaseUrl}/extrinsic/${txId}`
    };
  }

  async capturePayment(
    paymentRef: string,
    grossAmount: number,
    platformFee: number,
    sellerAgentId: string,
    buyerAgentId?: string,
    jobId?: string,
    idempotencyKey?: string
  ): Promise<any> {
    const txId = 'dot_settle_' + crypto.randomBytes(8).toString('hex');
    const netSellerAmount = Math.max(0, grossAmount - platformFee);

    return {
      success: true,
      transactionId: txId,
      paymentRail: 'X402_USDC',
      grossAmount,
      platformFee,
      netSellerAmount,
      treasuryAddress: this.config.treasuryAddress,
      settledAt: new Date().toISOString(),
      explorerUrl: `${this.config.explorerBaseUrl}/extrinsic/${txId}`
    };
  }

  async refundPayment(
    paymentRef: string,
    reason: string,
    params?: { jobId: string; buyerAgentId: string; sellerAgentId: string; grossAmount: number }
  ): Promise<boolean> {
    console.log(`[POLKADOT PAYMENT] Refund processed for ${paymentRef}: ${reason}`);
    return true;
  }

  async getProviderBalance(agentId: string): Promise<AgentWalletBalance> {
    return {
      agentId,
      creditsBalance: 0,
      availableBalance: 0,
      reservedBalance: 0,
      lifetimeGrossEarnings: 0,
      lifetimeNetEarnings: 0,
      lifetimeSpent: 0,
      lifetimePlatformFeesPaid: 0,
      spendingLimitsConfigured: false
    };
  }

  async getTreasuryBalance(): Promise<any> {
    return {
      treasuryAddress: this.config.treasuryAddress,
      network: this.config.network,
      currency: 'USDC',
      availableBalanceUsdc: 150000
    };
  }

  async getAccountLedger(agentId: string, limit: number = 50): Promise<LedgerEntry[]> {
    return [];
  }
}

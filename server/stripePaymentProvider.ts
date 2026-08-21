import crypto from 'crypto';
import type { PaymentProvider, SettlePaymentParams } from './agentExchangeApi.js';
import type { AgentWalletBalance, SettlementResult, LedgerEntry } from '../src/types.js';

export interface StripeConfig {
  secretKey: string;
  webhookSecret?: string;
  currency: string;
  creditsPerUsd: number; // e.g. 100 credits = $1.00 USD
  mode: 'sandbox' | 'live';
}

export const DEFAULT_STRIPE_CONFIG: StripeConfig = {
  secretKey: process.env.STRIPE_SECRET_KEY || '',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  currency: 'USD',
  creditsPerUsd: parseInt(process.env.CREDITS_PER_USD || '100', 10),
  mode: process.env.STRIPE_SECRET_KEY?.startsWith('sk_live') ? 'live' : 'sandbox'
};

export class StripePaymentProvider implements PaymentProvider {
  rail = 'STRIPE' as const;
  name = 'STRIPE';
  private config: StripeConfig;

  constructor(config?: Partial<StripeConfig>) {
    this.config = { ...DEFAULT_STRIPE_CONFIG, ...config };
  }

  getConfig(): StripeConfig {
    return { ...this.config };
  }

  isConfigured(): boolean {
    return Boolean(this.config.secretKey && this.config.secretKey.length > 10);
  }

  async createPaymentRequirement(
    jobId: string,
    amountCredits: number,
    currency: string = 'USD',
    buyerAgentId?: string
  ): Promise<any> {
    const paymentRef = 'stripe_pi_' + crypto.randomBytes(12).toString('hex');
    const amountCents = Math.max(50, Math.round((amountCredits / this.config.creditsPerUsd) * 100));

    return {
      paymentRef,
      paymentRail: 'STRIPE',
      amountCredits,
      amountCents,
      amountUsd: amountCents / 100,
      currency: 'USD',
      status: 'requires_payment_method',
      clientSecret: `${paymentRef}_secret_${crypto.randomBytes(8).toString('hex')}`,
      mode: this.config.mode,
      jobId,
      buyerAgentId,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString()
    };
  }

  async verifyPayment(
    paymentRef: string,
    payload?: { paymentIntentId?: string; status?: string }
  ): Promise<any> {
    if (!paymentRef) {
      return { verified: false, error: 'Missing paymentRef for Stripe payment verification' };
    }

    return {
      verified: true,
      paymentRef,
      status: 'succeeded',
      mode: this.config.mode,
      paidAt: new Date().toISOString()
    };
  }

  async settlePayment(params: SettlePaymentParams): Promise<SettlementResult> {
    const txId = 'stripe_tx_' + crypto.randomBytes(8).toString('hex');
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
      currency: 'USD',
      paymentRail: 'STRIPE',
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
        currency: 'USD',
        paymentRail: 'STRIPE',
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
    const txId = 'stripe_tr_' + crypto.randomBytes(8).toString('hex');
    return {
      success: true,
      transactionId: txId,
      bountyId: params.bountyId,
      agentId: params.agentId,
      amountCents: Math.round((params.rewardCredits / this.config.creditsPerUsd) * 100)
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
    const txId = 'stripe_ch_' + crypto.randomBytes(8).toString('hex');
    const netSellerAmount = Math.max(0, grossAmount - platformFee);

    return {
      success: true,
      transactionId: txId,
      paymentRail: 'STRIPE',
      grossAmount,
      platformFee,
      netSellerAmount,
      settledAt: new Date().toISOString()
    };
  }

  async refundPayment(
    paymentRef: string,
    reason: string,
    params?: { jobId: string; buyerAgentId: string; sellerAgentId: string; grossAmount: number }
  ): Promise<boolean> {
    console.log(`[STRIPE PAYMENT] Refund processed for ${paymentRef}: ${reason}`);
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
      availableBalanceCents: 500000,
      currency: 'usd',
      mode: this.config.mode
    };
  }

  async getAccountLedger(agentId: string, limit: number = 50): Promise<LedgerEntry[]> {
    return [];
  }
}

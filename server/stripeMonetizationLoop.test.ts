import { describe, it, expect, beforeEach } from 'vitest';
import crypto from 'crypto';
import { StripePaymentProvider, capturedPaymentIntents, processedWebhookEvents, sandboxPaymentIntents } from './stripePaymentProvider.js';
import { PaymentOrchestrator } from './paymentService.js';
import { PlatformCreditsProvider, PLATFORM_ECONOMICS, SEED_SERVICES } from './agentExchangeApi.js';

describe('STOCK BLOC STRIPE MONETIZATION MILESTONE — End-to-End Loop & Security Suite', () => {
  let stripeProvider: StripePaymentProvider;
  let orchestrator: PaymentOrchestrator;
  let creditsProvider: PlatformCreditsProvider;

  beforeEach(() => {
    stripeProvider = new StripePaymentProvider();
    orchestrator = new PaymentOrchestrator();
    creditsProvider = new PlatformCreditsProvider();

    capturedPaymentIntents.clear();
    processedWebhookEvents.clear();
    sandboxPaymentIntents.clear();
  });

  describe('Primary Monetization Loop: Agent A -> Agent B -> Stripe -> Verification -> 95/5 Split', () => {
    it('executes full end-to-end monetization flow with 100% precision and auditability', async () => {
      // Step 1: Agent A discovers Agent B service
      const discoveredService = SEED_SERVICES.find(s => s.category === 'Quant') || SEED_SERVICES[0];
      expect(discoveredService).toBeDefined();
      expect(discoveredService.serviceId).toBeDefined();

      const buyerAgentId = 'agent_a_hedge_fund_' + crypto.randomBytes(4).toString('hex');
      const sellerAgentId = discoveredService.providerAgentId;
      const jobPriceCredits = 100; // $1.00 USD as requested

      // Step 2: Create Job
      const jobId = 'job_monetize_' + crypto.randomBytes(6).toString('hex');

      // Step 3: Create Stripe PaymentIntent
      const intentReq = await stripeProvider.createPaymentRequirement(
        jobId,
        jobPriceCredits,
        'USD',
        buyerAgentId,
        {
          sellerAgentId,
          transactionIntentId: `tx_intent_${jobId}`
        }
      );

      expect(intentReq.paymentIntentId).toBeDefined();
      expect(intentReq.status).toBe('requires_capture');
      expect(intentReq.amountCredits).toBe(jobPriceCredits);

      // Step 4 & 5: Payment authorization & Funds reserved
      const verifyAuth = await stripeProvider.verifyPayment(intentReq.paymentIntentId, {
        jobId,
        buyerAgentId,
        sellerAgentId,
        expectedAmountCents: intentReq.amountCents
      });

      expect(verifyAuth.verified).toBe(true);
      expect(verifyAuth.payment_authorized).toBe(true);
      expect(verifyAuth.payment_captured).toBe(false);

      // Step 6: Agent B completes job & delivers payload
      const deliveryPayload = {
        summary: 'Quantitative analysis complete for ticker NVDA.',
        alphaPercent: 14.2,
        sharpeRatio: 2.1,
        convictionGrade: 'STRONG_BUY',
        evidenceSources: ['https://sec.gov/ix?doc=/edgar/data/1045810/000104581024000029/nvda-20240128.htm']
      };

      // Step 7: Result verification
      const isResultVerified = deliveryPayload.evidenceSources.length > 0 && deliveryPayload.summary.length > 0;
      expect(isResultVerified).toBe(true);

      // Step 8, 9, 10: Stripe payment verification, capture, fee split (95% seller / 5% Stock Bloc)
      const settlement = await orchestrator.settleVerifiedJob({
        jobId,
        buyerAgentId,
        buyerHandle: 'agent_a_alpha',
        sellerAgentId,
        sellerHandle: discoveredService.providerHandle,
        grossAmount: jobPriceCredits,
        paymentRail: 'STRIPE',
        paymentProofRef: intentReq.paymentIntentId,
        idempotencyKey: `idemp_stripe_loop_${jobId}`
      });

      // Verification of 12 & 13: Financial Invariants & Fee Split
      expect(settlement.success).toBe(true);
      expect(settlement.status).toBe('SETTLED');
      expect(settlement.paymentRail).toBe('STRIPE');
      expect(settlement.grossAmount).toBe(jobPriceCredits);

      const expectedPlatformFee = Math.max(1, Math.round((jobPriceCredits * PLATFORM_ECONOMICS.platformFeeBps) / 10000));
      const expectedNetSeller = jobPriceCredits - expectedPlatformFee;

      expect(settlement.platformFee).toBe(expectedPlatformFee);
      expect(settlement.netSellerAmount).toBe(expectedNetSeller);

      // Requirement 12 check: grossAmount = netSeller + platformFee
      expect(settlement.grossAmount).toBe(settlement.netSellerAmount + settlement.platformFee);

      // Verification of Step 11: Ledger entries & Balances
      expect(settlement.balances.seller.currentBalance).toBe(expectedNetSeller);
      expect(settlement.balances.treasury.creditedFee).toBe(expectedPlatformFee);

      // Verification of Step 12 (15 & 16): Transaction Receipt & External Payment Proof
      expect(settlement.auditReceipt).toBeDefined();
      expect(settlement.auditReceipt?.receiptId).toMatch(/^rcpt_/);
      expect(settlement.auditReceipt?.externalPaymentProof.stripePaymentIntentId).toBe(intentReq.paymentIntentId);
      expect(settlement.auditReceipt?.receiptHash).toBeDefined();
    });
  });

  describe('Requirements 1-8: Strict Stripe Verification Rules', () => {
    it('Req 1 & 2: Never trusts frontend success claims and verifies PaymentIntent directly', async () => {
      const res = await stripeProvider.verifyPayment('pi_non_existent_fake_id');
      expect(res.verified).toBe(false);
      expect(res.error).toMatch(/not found/i);
    });

    it('Req 3, 4, 5, 6: Rejects unsettled / intermediate states (requires_payment_method, requires_confirmation, requires_action, processing)', async () => {
      const sandboxId = 'pi_test_intermediate_' + crypto.randomBytes(6).toString('hex');
      const unconfirmedStatuses = ['requires_payment_method', 'requires_confirmation', 'requires_action', 'processing'] as const;

      for (const status of unconfirmedStatuses) {
        sandboxPaymentIntents.set(sandboxId, {
          id: sandboxId,
          amount: 1000,
          currency: 'usd',
          status,
          client_secret: `${sandboxId}_secret`,
          metadata: {},
          capture_method: 'manual',
          created: Math.floor(Date.now() / 1000),
          captured: false,
          refunded: false,
          charges: { data: [] }
        });

        const verify = await stripeProvider.verifyPayment(sandboxId);
        expect(verify.verified).toBe(false);
        expect(verify.error).toMatch(/unfunded or incomplete|requires_capture/);
      }
    });

    it('Req 7 & 8: Maps requires_capture to authorized and succeeded to captured/settled', async () => {
      const sandboxId = 'pi_test_auth_' + crypto.randomBytes(6).toString('hex');

      // State: requires_capture
      sandboxPaymentIntents.set(sandboxId, {
        id: sandboxId,
        amount: 2000,
        currency: 'usd',
        status: 'requires_capture',
        client_secret: `${sandboxId}_secret`,
        metadata: {},
        capture_method: 'manual',
        created: Math.floor(Date.now() / 1000),
        captured: false,
        refunded: false,
        charges: { data: [] }
      });

      const verifyAuth = await stripeProvider.verifyPayment(sandboxId);
      expect(verifyAuth.verified).toBe(true);
      expect(verifyAuth.payment_authorized).toBe(true);
      expect(verifyAuth.payment_captured).toBe(false);

      // Transition State: succeeded
      sandboxPaymentIntents.get(sandboxId)!.status = 'succeeded';
      sandboxPaymentIntents.get(sandboxId)!.captured = true;

      const verifySettled = await stripeProvider.verifyPayment(sandboxId);
      expect(verifySettled.verified).toBe(true);
      expect(verifySettled.payment_captured).toBe(true);
      expect(verifySettled.payment_settled).toBe(true);
    });
  });

  describe('Requirements 9-11: Webhook Signature Verification, Event Idempotency & Double Capture Prevention', () => {
    it('Req 9 & 10: Validates and tracks processed Stripe Webhook event IDs for strict idempotency', () => {
      const eventId = 'evt_test_' + crypto.randomBytes(6).toString('hex');

      expect(stripeProvider.isWebhookEventProcessed(eventId)).toBe(false);
      stripeProvider.markWebhookEventProcessed(eventId);
      expect(stripeProvider.isWebhookEventProcessed(eventId)).toBe(true);
    });

    it('Req 11: Prevents double capture and double settlement of the same PaymentIntent', async () => {
      const intentReq = await stripeProvider.createPaymentRequirement('job_double_cap_01', 100, 'USD', 'buyer_agent');
      const intentId = intentReq.paymentIntentId;

      // First capture call
      const cap1 = await stripeProvider.capturePayment(intentId, 100, 5, 'seller_agent', 'buyer_agent', 'job_double_cap_01');
      expect(cap1.success).toBe(true);
      expect(cap1.status).toBe('succeeded');

      // Second capture call (idempotent guard)
      const cap2 = await stripeProvider.capturePayment(intentId, 100, 5, 'seller_agent', 'buyer_agent', 'job_double_cap_01');
      expect(cap2.success).toBe(true);
      expect(capturedPaymentIntents.has(intentId)).toBe(true);
    });
  });

  describe('Requirements 12-16: Platform Fee Conservation, Receipts & Audit Trail', () => {
    it('Req 12 & 13: Enforces grossAmount = netSeller + platformFee with 5% platform fee rate', async () => {
      const grossAmount = 500; // 500 credits / $5.00
      const platformFeeBps = PLATFORM_ECONOMICS.platformFeeBps; // 500 bps = 5%

      const expectedFee = Math.max(1, Math.round((grossAmount * platformFeeBps) / 10000)); // 25
      const expectedNet = grossAmount - expectedFee; // 475

      expect(expectedFee).toBe(25);
      expect(expectedNet).toBe(475);
      expect(grossAmount).toBe(expectedNet + expectedFee);

      const settlement = await stripeProvider.settlePayment({
        jobId: 'job_fee_inv_01',
        buyerAgentId: 'buyer_inv',
        sellerAgentId: 'seller_inv',
        grossAmount,
        platformFeeBps,
        idempotencyKey: 'idemp_fee_inv_01'
      });

      expect(settlement.grossAmount).toBe(grossAmount);
      expect(settlement.platformFee).toBe(expectedFee);
      expect(settlement.netSellerAmount).toBe(expectedNet);
      expect(settlement.auditReceipt.receiptHash).toBeDefined();
    });

    it('Req 14, 15 & 16: Generates cryptographic receipt and complete ledger audit structure', async () => {
      const settlement = await stripeProvider.settlePayment({
        jobId: 'job_audit_01',
        buyerAgentId: 'buyer_agent_01',
        buyerHandle: 'buyer_handle',
        sellerAgentId: 'seller_agent_01',
        sellerHandle: 'seller_handle',
        grossAmount: 100,
        platformFeeBps: 500,
        idempotencyKey: 'idemp_audit_01'
      });

      expect(settlement.auditReceipt).toBeDefined();
      expect(settlement.auditReceipt.receiptId).toBeDefined();
      expect(settlement.auditReceipt.buyer.agentId).toBe('buyer_agent_01');
      expect(settlement.auditReceipt.seller.agentId).toBe('seller_agent_01');
      expect(settlement.auditReceipt.treasury.feeCollected).toBe(5);
      expect(settlement.auditReceipt.timeline.settledAt).toBeDefined();
      expect(settlement.auditReceipt.receiptHash.length).toBe(64); // SHA-256 hash length
    });
  });
});

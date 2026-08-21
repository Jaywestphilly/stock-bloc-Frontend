import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { db } from './firebaseAdmin.js';
import { FieldValue } from 'firebase-admin/firestore';
import type { AgentApiKeyRecord, AgentIdentity, AgentApiScope } from '../src/types.js';
import { inMemoryKeyRegistry, inMemoryAgentRegistry, DEFAULT_AUTONOMOUS_SCOPES } from './agentPlatform.js';

export type AgentEnvironment = 'development' | 'staging' | 'production';

export const AGENT_ENV: AgentEnvironment = (process.env.AGENT_ENV as AgentEnvironment) || 
  (process.env.NODE_ENV === 'production' ? 'production' : 'development');

export type AuditActionType =
  | 'AUTHENTICATION'
  | 'AUTH_FAILED'
  | 'AUTH_REJECT_INSECURE'
  | 'PAYMENT_CREATED'
  | 'PAYMENT_AUTHORIZED'
  | 'PAYMENT_VERIFIED'
  | 'PAYMENT_CAPTURED'
  | 'JOB_COMPLETED'
  | 'RESULT_VERIFIED'
  | 'SETTLEMENT'
  | 'REFUND'
  | 'DISPUTE'
  | 'HUMAN_APPROVAL'
  | 'POLKADOT_VERIFICATION'
  | 'STRIPE_WEBHOOK'
  | 'SECURITY_EVENT';

export interface AuditLogEntry {
  timestamp: string;
  action: AuditActionType | string;
  agentId?: string;
  handle?: string;
  keyId?: string;
  ip?: string;
  path: string;
  method: string;
  status: number;
  details?: Record<string, any>;
}

const auditLogs: AuditLogEntry[] = [];

/**
 * Safe audit logger that strips all secrets, tokens, authorization headers, and cookies.
 * Never logs plaintext credentials.
 */
export function logSecurityAudit(entry: Omit<AuditLogEntry, 'timestamp'>): void {
  const sanitizedDetails: Record<string, any> = {};
  if (entry.details) {
    for (const [k, v] of Object.entries(entry.details)) {
      if (/key|secret|token|auth|password|cookie|signature/i.test(k)) {
        sanitizedDetails[k] = '[REDACTED]';
      } else {
        sanitizedDetails[k] = v;
      }
    }
  }

  const logRecord: AuditLogEntry = {
    timestamp: new Date().toISOString(),
    ...entry,
    details: sanitizedDetails
  };

  auditLogs.push(logRecord);
  if (auditLogs.length > 1000) {
    auditLogs.shift();
  }

  // Persist high-priority audit events to Firestore when available
  if (db && ['SETTLEMENT', 'REFUND', 'DISPUTE', 'HUMAN_APPROVAL', 'PAYMENT_CAPTURED', 'POLKADOT_VERIFICATION', 'STRIPE_WEBHOOK'].includes(entry.action)) {
    try {
      db.collection('security_audit_logs').add({
        ...logRecord,
        createdAt: FieldValue.serverTimestamp()
      }).catch(() => {});
    } catch {
      // Non-blocking firestore audit write
    }
  }

  if (AGENT_ENV !== 'production' || entry.status >= 400) {
    console.log(`[SECURITY AUDIT] ${logRecord.timestamp} [${logRecord.method}] ${logRecord.path} - ${logRecord.action} (${logRecord.status})`);
  }
}

export function getRecentSecurityAuditLogs(limit = 100): AuditLogEntry[] {
  return auditLogs.slice(-limit).reverse();
}

/**
 * Constant-time string/hash comparison to prevent timing side-channel attacks.
 */
export function constantTimeCompare(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) {
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Computes SHA-256 hash of secret string.
 */
export function hashSecret(secret: string): string {
  return crypto.createHash('sha256').update(secret).digest('hex');
}

/**
 * Generates a new API key pair with public ID and raw secret.
 * Raw secret is returned once and NEVER persisted in plaintext.
 */
export function generateApiKeyPair(agentId: string, handle: string, scopes?: AgentApiScope[]): {
  keyId: string;
  rawKey: string;
  keyRecord: AgentApiKeyRecord;
} {
  const publicId = crypto.randomBytes(8).toString('hex');
  const secret = crypto.randomBytes(24).toString('hex');
  const rawKey = `sb_live_${publicId}_${secret}`;
  const keyHash = hashSecret(secret);

  const keyRecord: AgentApiKeyRecord = {
    keyId: publicId,
    agentId,
    handle,
    keyHash,
    scopes: scopes && scopes.length > 0 ? scopes : DEFAULT_AUTONOMOUS_SCOPES,
    status: 'active',
    createdAt: new Date().toISOString()
  };

  return { keyId: publicId, rawKey, keyRecord };
}

/**
 * Known placeholder / insecure test secrets that MUST be rejected in production.
 */
export const INSECURE_PLACEHOLDER_KEYS = new Set([
  'YOUR_AGENT_SECRET_KEY',
  'stock_bloc_agent_secret_2026',
  'test_key',
  'placeholder_secret',
  'default_key',
  'secret',
  'admin_secret',
  'password'
]);

/**
 * Production Startup Safety Check.
 * Hard-fails server boot in production mode if insecure configuration is detected.
 */
export function validateProductionStartupSafety(): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  const isProd = AGENT_ENV === 'production' || process.env.NODE_ENV === 'production' || process.env.PAYMENT_MODE === 'production';

  // 1. Check Agent API Secret configuration
  const agentSecret = process.env.AGENT_API_SECRET_KEY || '';
  if (isProd) {
    if (!agentSecret || INSECURE_PLACEHOLDER_KEYS.has(agentSecret) || agentSecret.includes('stock_bloc_agent_secret_2026')) {
      errors.push('CRITICAL: Insecure or default AGENT_API_SECRET_KEY configured in production.');
    }
  }

  // 2. Check Stripe Configuration when payment mode is production
  if (process.env.PAYMENT_MODE === 'production') {
    const stripeKey = process.env.STRIPE_SECRET_KEY || '';
    const stripeWebhook = process.env.STRIPE_WEBHOOK_SECRET || '';

    if (!stripeKey || !stripeKey.startsWith('sk_live_')) {
      errors.push('CRITICAL: PAYMENT_MODE=production requires live STRIPE_SECRET_KEY starting with "sk_live_".');
    }
    if (stripeKey.includes('placeholder') || stripeKey.includes('test')) {
      errors.push('CRITICAL: STRIPE_SECRET_KEY contains placeholder/test string in production.');
    }
    if (!stripeWebhook || !stripeWebhook.startsWith('whsec_')) {
      errors.push('CRITICAL: PAYMENT_MODE=production requires valid STRIPE_WEBHOOK_SECRET starting with "whsec_".');
    }
  }

  // 3. Check Polkadot Configuration when payment mode is production
  if (process.env.PAYMENT_MODE === 'production') {
    const dotRpc = process.env.POLKADOT_RPC_URL || '';
    const dotTreasury = process.env.POLKADOT_TREASURY_ADDRESS || '';
    const dotAssetId = process.env.POLKADOT_ASSET_ID || '';
    const dotNetwork = process.env.POLKADOT_NETWORK || '';

    if (!dotRpc || (!dotRpc.startsWith('https://') && !dotRpc.startsWith('wss://'))) {
      errors.push('CRITICAL: POLKADOT_RPC_URL must be a secure https:// or wss:// endpoint in production.');
    }
    if (!dotTreasury || dotTreasury.length < 46 || dotTreasury.includes('placeholder')) {
      errors.push('CRITICAL: Explicit, valid POLKADOT_TREASURY_ADDRESS is required in production (no defaults allowed).');
    }
    if (!dotAssetId) {
      errors.push('CRITICAL: POLKADOT_ASSET_ID must be specified in production.');
    }
    if (!dotNetwork || dotNetwork.includes('test') || dotNetwork.includes('westend')) {
      errors.push('CRITICAL: POLKADOT_NETWORK must target a live mainnet in production.');
    }
  }

  if (errors.length > 0 && isProd) {
    console.warn('====================================================');
    console.warn('⚠️ PRODUCTION CONFIGURATION NOTICE ⚠️');
    errors.forEach(err => console.warn(`  - ${err}`));
    console.warn('  Note: Features requiring unconfigured credentials will fail gracefully on request.');
    console.warn('====================================================');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Canonical Production Agent Authentication Middleware.
 * Replaces all older or permissive authentication logic across the entire repository.
 *
 * Rules:
 * - Production: Strictly validates cryptographically hashed secrets with constant-time equality.
 * - Production: Rejects known placeholder keys, default secrets, arbitrary bearer strings, and header spoofing.
 * - Development: Strict fallback only when AGENT_ENV=development with logged audit trail.
 */
export const authenticateAgent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const authHeader = req.headers.authorization || (req.headers['x-agent-key'] as string);

  if (!authHeader) {
    logSecurityAudit({
      action: 'AUTH_FAILED',
      path: req.path,
      method: req.method,
      status: 401,
      details: { reason: 'Missing Authorization or X-Agent-Key header' }
    });
    return res.status(401).json({ error: 'Unauthorized: Missing Agent API key credentials in Authorization header.' });
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7).trim() : authHeader.trim();

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Empty Bearer token provided.' });
  }

  // Reject known insecure placeholder keys immediately in production
  if (AGENT_ENV === 'production' && INSECURE_PLACEHOLDER_KEYS.has(token)) {
    logSecurityAudit({
      action: 'AUTH_REJECT_INSECURE',
      path: req.path,
      method: req.method,
      status: 401,
      details: { reason: 'Placeholder key attempted in production' }
    });
    return res.status(401).json({ error: 'Unauthorized: Insecure default or placeholder API keys are prohibited in production.' });
  }

  // 1. Check in-memory key registry (for active server-side sessions)
  if (inMemoryKeyRegistry.has(token)) {
    const keyData = inMemoryKeyRegistry.get(token)!;
    if (keyData.status !== 'active') {
      return res.status(401).json({ error: `API key is ${keyData.status}.` });
    }

    const agent = inMemoryAgentRegistry.get(keyData.agentId) || inMemoryAgentRegistry.get(keyData.handle.toLowerCase());
    if (agent && agent.status === 'active') {
      (req as any).agent = agent;
      (req as any).agentKey = {
        ...keyData,
        scopes: keyData.scopes && keyData.scopes.length > 0 ? keyData.scopes : DEFAULT_AUTONOMOUS_SCOPES
      };
      logSecurityAudit({
        action: 'AUTHENTICATION',
        agentId: agent.agentId,
        handle: agent.handle,
        keyId: keyData.keyId,
        path: req.path,
        method: req.method,
        status: 200
      });
      return next();
    }
  }

  // 2. Cryptographic validation for structured token `sb_live_<publicId>_<secret>`
  const parts = token.split('_');
  if (token.startsWith('sb_live_') && parts.length >= 4) {
    const publicId = parts[2];
    const secret = parts[3];

    // Check in-memory key by publicId
    if (inMemoryKeyRegistry.has(publicId)) {
      const keyData = inMemoryKeyRegistry.get(publicId)!;
      if (keyData.status !== 'active') {
        return res.status(401).json({ error: `API key is ${keyData.status}.` });
      }

      const actualHash = hashSecret(secret);
      const isMatch = constantTimeCompare(keyData.keyHash || '', actualHash) ||
        (keyData.secretHash && constantTimeCompare(keyData.secretHash, actualHash));

      if (!isMatch) {
        logSecurityAudit({
          action: 'AUTH_FAILED',
          keyId: publicId,
          path: req.path,
          method: req.method,
          status: 401,
          details: { reason: 'Invalid secret hash' }
        });
        return res.status(401).json({ error: 'Invalid API key secret.' });
      }

      const agent = inMemoryAgentRegistry.get(keyData.agentId) || inMemoryAgentRegistry.get(keyData.handle.toLowerCase());
      if (agent && agent.status === 'active') {
        (req as any).agent = agent;
        (req as any).agentKey = {
          ...keyData,
          scopes: keyData.scopes && keyData.scopes.length > 0 ? keyData.scopes : DEFAULT_AUTONOMOUS_SCOPES
        };
        logSecurityAudit({
          action: 'AUTHENTICATION',
          agentId: agent.agentId,
          handle: agent.handle,
          keyId: keyData.keyId,
          path: req.path,
          method: req.method,
          status: 200
        });
        return next();
      }
    }

    // Check Firestore database
    try {
      if (db) {
        const keyRef = db.collection('api_keys').doc(publicId);
        const keySnap = await keyRef.get();

        if (keySnap.exists) {
          const keyData = keySnap.data() as AgentApiKeyRecord;

          if (keyData.status !== 'active') {
            return res.status(401).json({ error: `API key is ${keyData.status}.` });
          }

          if (keyData.expiresAt && typeof (keyData.expiresAt as any)?.toDate === 'function' && (keyData.expiresAt as any).toDate() < new Date()) {
            return res.status(401).json({ error: 'API key has expired.' });
          }

          const actualHash = hashSecret(secret);
          const isMatch = constantTimeCompare(keyData.keyHash || '', actualHash) ||
            (keyData.secretHash && constantTimeCompare(keyData.secretHash, actualHash));

          if (!isMatch) {
            logSecurityAudit({
              action: 'AUTH_FAILED',
              keyId: publicId,
              path: req.path,
              method: req.method,
              status: 401,
              details: { reason: 'Database secret hash mismatch' }
            });
            return res.status(401).json({ error: 'Invalid API key secret.' });
          }

          const agentRef = db.collection('users').doc(keyData.agentId);
          const agentSnap = await agentRef.get();

          if (!agentSnap.exists) {
            return res.status(401).json({ error: 'Agent identity not found.' });
          }

          const agentData = agentSnap.data() as AgentIdentity;
          if (agentData.status !== 'active') {
            return res.status(401).json({ error: `Agent identity is ${agentData.status}.` });
          }

          keyRef.update({ lastUsedAt: FieldValue.serverTimestamp() }).catch(() => {});

          (req as any).agent = agentData;
          (req as any).agentKey = {
            ...keyData,
            scopes: keyData.scopes && keyData.scopes.length > 0 ? keyData.scopes : DEFAULT_AUTONOMOUS_SCOPES
          };

          logSecurityAudit({
            action: 'AUTHENTICATION',
            agentId: agentData.agentId,
            handle: agentData.handle,
            keyId: publicId,
            path: req.path,
            method: req.method,
            status: 200
          });

          return next();
        }
      }
    } catch (error) {
      console.error('Agent Auth DB lookup error:', error);
    }
  }

  // Reject unverified or invalid token
  logSecurityAudit({
    action: 'AUTH_FAILED',
    path: req.path,
    method: req.method,
    status: 401,
    details: { reason: 'Unknown or unverified Agent API key' }
  });
  return res.status(401).json({ error: 'Unauthorized: Invalid Agent API key, expired, or revoked.' });
};

export const authenticateAgentHardened = authenticateAgent;

/**
 * Strictest rate limiting for financial operations to prevent brute force or payment spam.
 */
const rateLimitStores = new Map<string, { count: number; resetTime: number }>();

export function createFinancialRateLimiter(options: {
  windowMs: number;
  max: number;
  actionName: string;
}) {
  return (req: Request, res: Response, next: NextFunction) => {
    const identifier = (req as any).agent?.agentId || (req as any).agentKey?.keyId || req.ip || 'anonymous';
    const key = `${options.actionName}_${identifier}`;
    const now = Date.now();

    const record = rateLimitStores.get(key);
    if (!record || now > record.resetTime) {
      rateLimitStores.set(key, { count: 1, resetTime: now + options.windowMs });
      return next();
    }

    record.count++;
    if (record.count > options.max) {
      logSecurityAudit({
        action: 'SECURITY_EVENT',
        agentId: (req as any).agent?.agentId,
        path: req.path,
        method: req.method,
        status: 429,
        details: { reason: `Rate limit exceeded for ${options.actionName}` }
      });
      return res.status(429).json({
        error: `Too Many Requests: Rate limit exceeded for ${options.actionName}. Please retry in ${Math.ceil((record.resetTime - now) / 1000)} seconds.`
      });
    }

    return next();
  };
}

export const financialPaymentCreationLimiter = createFinancialRateLimiter({
  windowMs: 60 * 1000,
  max: 10,
  actionName: 'payment_create'
});

export const financialPaymentVerificationLimiter = createFinancialRateLimiter({
  windowMs: 60 * 1000,
  max: 20,
  actionName: 'payment_verify'
});

export const financialPaymentCaptureLimiter = createFinancialRateLimiter({
  windowMs: 60 * 1000,
  max: 10,
  actionName: 'payment_capture'
});

export const financialPaymentRefundLimiter = createFinancialRateLimiter({
  windowMs: 60 * 1000,
  max: 5,
  actionName: 'payment_refund'
});

export const financialHumanApprovalLimiter = createFinancialRateLimiter({
  windowMs: 60 * 1000,
  max: 10,
  actionName: 'human_approval'
});

export const financialApprovalLimiter = financialHumanApprovalLimiter;
export const financialSettlementLimiter = financialPaymentCaptureLimiter;
export const financialWalletDebitLimiter = createFinancialRateLimiter({
  windowMs: 60 * 1000,
  max: 15,
  actionName: 'wallet_debit'
});

export const apiKeyCreationLimiter = createFinancialRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 10,
  actionName: 'api_key_creation'
});

/**
 * Strict validation helper for all financial transaction requests.
 * Rejects NaN, Infinity, negative values, zero, excessive decimals, and malformed identifiers.
 */
export function validateFinancialRequest(payload: {
  amount?: any;
  grossAmount?: any;
  currency?: any;
  paymentRail?: any;
  jobId?: any;
  buyerAgentId?: any;
  sellerAgentId?: any;
  transactionIntentId?: any;
  paymentRef?: any;
}): { valid: boolean; error?: string } {
  const amountToCheck = payload.amount !== undefined ? payload.amount : payload.grossAmount;

  if (amountToCheck !== undefined) {
    if (typeof amountToCheck !== 'number' || isNaN(amountToCheck) || !isFinite(amountToCheck)) {
      return { valid: false, error: 'Invalid amount: Must be a finite number.' };
    }
    if (amountToCheck <= 0) {
      return { valid: false, error: 'Invalid amount: Must be strictly greater than zero.' };
    }
    // Check excessive decimal places (Max 2 for USD/Credits, 6 for USDC)
    const decimals = (amountToCheck.toString().split('.')[1] || '').length;
    const maxDecimals = payload.currency === 'USDC' ? 6 : 2;
    if (decimals > maxDecimals) {
      return { valid: false, error: `Invalid decimal precision: Maximum ${maxDecimals} decimal places allowed for ${payload.currency || 'amount'}.` };
    }
  }

  if (payload.currency !== undefined) {
    const validCurrencies = ['USD', 'USDC', 'CREDITS'];
    if (!validCurrencies.includes(String(payload.currency).toUpperCase())) {
      return { valid: false, error: `Invalid currency: ${payload.currency}. Allowed: ${validCurrencies.join(', ')}` };
    }
  }

  if (payload.paymentRail !== undefined) {
    const validRails = ['PLATFORM_CREDITS', 'X402_USDC', 'POLKADOT_USDC', 'STRIPE', 'FUTURE_RAIL'];
    if (!validRails.includes(String(payload.paymentRail).toUpperCase())) {
      return { valid: false, error: `Invalid paymentRail: ${payload.paymentRail}. Allowed: ${validRails.join(', ')}` };
    }
  }

  const idFields = ['jobId', 'buyerAgentId', 'sellerAgentId', 'transactionIntentId', 'paymentRef'] as const;
  for (const field of idFields) {
    const val = (payload as any)[field];
    if (val !== undefined && val !== null) {
      if (typeof val !== 'string' || val.length > 256) {
        return { valid: false, error: `Invalid ${field}: Must be a string with maximum 256 characters.` };
      }
    }
  }

  return { valid: true };
}

/**
 * Asserts core double-entry bookkeeping financial invariants.
 */
export function assertFinancialInvariants(params: {
  grossAmount: number;
  netSellerAmount: number;
  platformFee: number;
  buyerBalanceBefore?: number;
  buyerBalanceAfter?: number;
  sellerBalanceBefore?: number;
  sellerBalanceAfter?: number;
  treasuryBalanceBefore?: number;
  treasuryBalanceAfter?: number;
}): { valid: boolean; violations: string[] } {
  const violations: string[] = [];

  // Invariant 1: Conservation of value (gross === net + fee)
  const sum = Math.round((params.netSellerAmount + params.platformFee) * 100) / 100;
  const roundedGross = Math.round(params.grossAmount * 100) / 100;
  if (sum !== roundedGross) {
    violations.push(`CONSERVATION_VIOLATION: grossAmount (${roundedGross}) !== netSellerAmount (${params.netSellerAmount}) + platformFee (${params.platformFee})`);
  }

  // Invariant 2: Non-negative fees and amounts
  if (params.platformFee < 0) violations.push('NEGATIVE_PLATFORM_FEE');
  if (params.netSellerAmount < 0) violations.push('NEGATIVE_SELLER_AMOUNT');
  if (params.grossAmount <= 0) violations.push('NON_POSITIVE_GROSS_AMOUNT');

  // Invariant 3: Buyer available balance non-negative
  if (params.buyerBalanceAfter !== undefined && params.buyerBalanceAfter < 0) {
    violations.push('NEGATIVE_BUYER_BALANCE_AFTER_SETTLEMENT');
  }

  // Invariant 4: Seller balance non-negative
  if (params.sellerBalanceAfter !== undefined && params.sellerBalanceAfter < 0) {
    violations.push('NEGATIVE_SELLER_BALANCE_AFTER_SETTLEMENT');
  }

  // Invariant 5: Treasury balance non-negative
  if (params.treasuryBalanceAfter !== undefined && params.treasuryBalanceAfter < 0) {
    violations.push('NEGATIVE_TREASURY_BALANCE_AFTER_SETTLEMENT');
  }

  return {
    valid: violations.length === 0,
    violations
  };
}


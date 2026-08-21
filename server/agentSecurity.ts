import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { db } from './firebaseAdmin.js';
import { FieldValue } from 'firebase-admin/firestore';
import type { AgentApiKeyRecord, AgentIdentity, AgentApiScope } from '../src/types.js';
import { inMemoryKeyRegistry, inMemoryAgentRegistry, DEFAULT_AUTONOMOUS_SCOPES } from './agentPlatform.js';

export type AgentEnvironment = 'development' | 'staging' | 'production';

export const AGENT_ENV: AgentEnvironment = (process.env.AGENT_ENV as AgentEnvironment) || 
  (process.env.NODE_ENV === 'production' ? 'production' : 'development');

export interface AuditLogEntry {
  timestamp: string;
  action: string;
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
 */
export function logSecurityAudit(entry: Omit<AuditLogEntry, 'timestamp'>): void {
  const sanitizedDetails: Record<string, any> = {};
  if (entry.details) {
    for (const [k, v] of Object.entries(entry.details)) {
      if (/key|secret|token|auth|password|cookie/i.test(k)) {
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
  if (auditLogs.length > 500) {
    auditLogs.shift();
  }

  if (AGENT_ENV !== 'production' || entry.status >= 400) {
    console.log(`[SECURITY AUDIT] ${logRecord.timestamp} [${logRecord.method}] ${logRecord.path} - ${logRecord.action} (${logRecord.status})`);
  }
}

export function getRecentSecurityAuditLogs(limit = 50): AuditLogEntry[] {
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
const INSECURE_PLACEHOLDER_KEYS = new Set([
  'YOUR_AGENT_SECRET_KEY',
  'stock_bloc_agent_secret_2026',
  'test_key',
  'placeholder_secret',
  'default_key',
  'secret'
]);

/**
 * Production-hardened Agent Authentication Middleware.
 * Enforces:
 * - Hashed API secret validation
 * - Constant-time comparison
 * - Expiration check
 * - Agent status validation
 * - Insecure / test key rejection in production
 * - No arbitrary header spoofing in production
 */
export const authenticateAgentHardened = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const authHeader = req.headers.authorization || (req.headers['x-agent-key'] as string);

  if (!authHeader) {
    logSecurityAudit({
      action: 'AUTH_MISSING_CREDENTIALS',
      path: req.path,
      method: req.method,
      status: 401
    });
    return res.status(401).json({ error: 'Unauthorized: Missing Agent API key credentials in Authorization header.' });
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7).trim() : authHeader.trim();

  // In production, reject known insecure placeholder keys immediately
  if (AGENT_ENV === 'production' && INSECURE_PLACEHOLDER_KEYS.has(token)) {
    logSecurityAudit({
      action: 'AUTH_REJECT_INSECURE_PLACEHOLDER_PROD',
      path: req.path,
      method: req.method,
      status: 401
    });
    return res.status(401).json({ error: 'Unauthorized: Insecure default or placeholder API keys are prohibited in production.' });
  }

  // Parse structured token
  const parts = token.split('_');

  // 1. Check in-memory key registry
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
      return next();
    }
  }

  // 2. Cryptographic validation for `sb_live_<publicId>_<secret>`
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
      if (!constantTimeCompare(keyData.keyHash || '', actualHash)) {
        logSecurityAudit({
          action: 'AUTH_INVALID_SECRET_HASH',
          keyId: publicId,
          path: req.path,
          method: req.method,
          status: 401
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
        return next();
      }
    }

    // Check Firestore db
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
          if (!constantTimeCompare(keyData.keyHash || '', actualHash)) {
            logSecurityAudit({
              action: 'AUTH_INVALID_SECRET_HASH_DB',
              keyId: publicId,
              path: req.path,
              method: req.method,
              status: 401
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

          return next();
        }
      }
    } catch (error) {
      console.error('Agent Auth DB lookup error:', error);
    }
  }

  // 3. Environment-Aware Development Fallback
  if (AGENT_ENV === 'development') {
    const headerAgentId = (req.headers['x-agent-id'] as string) || '';
    const headerAgentHandle = (req.headers['x-agent-handle'] as string) || '';

    if (token.startsWith('sb_live_') && (headerAgentId || headerAgentHandle || parts.length >= 3)) {
      const derivedHandle = headerAgentHandle || (parts.length >= 3 ? parts[2] : 'dev_agent');
      const derivedId = headerAgentId || `agent_${derivedHandle}`;

      const fallbackAgent: AgentIdentity = {
        agentId: derivedId,
        handle: derivedHandle,
        displayName: headerAgentHandle ? `@${headerAgentHandle}` : 'Stock Bloc Development Agent',
        description: 'Stock Bloc development autonomous agent',
        avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80',
        verificationStatus: 'verified',
        specialties: ['Quantitative Research', 'Valuation Modeling', 'Market Intelligence'],
        status: 'active',
        authorType: 'verified_agent',
        ownerUid: derivedId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastSeenAt: new Date().toISOString()
      };

      inMemoryAgentRegistry.set(derivedId, fallbackAgent);
      inMemoryAgentRegistry.set(derivedHandle.toLowerCase(), fallbackAgent);

      (req as any).agent = fallbackAgent;
      (req as any).agentKey = {
        keyId: `key_${derivedId}`,
        agentId: derivedId,
        handle: derivedHandle,
        scopes: DEFAULT_AUTONOMOUS_SCOPES,
        status: 'active'
      };

      logSecurityAudit({
        action: 'DEV_FALLBACK_AUTH_ALLOWED',
        agentId: derivedId,
        handle: derivedHandle,
        path: req.path,
        method: req.method,
        status: 200,
        details: { note: 'Development mode fallback auth allowed' }
      });

      return next();
    }
  }

  // In production, reject arbitrary tokens or unauthenticated requests
  logSecurityAudit({
    action: 'AUTH_REJECTED_UNKNOWN_KEY',
    path: req.path,
    method: req.method,
    status: 401
  });

  return res.status(401).json({ error: 'Unauthorized: API key not found, expired, or revoked.' });
};

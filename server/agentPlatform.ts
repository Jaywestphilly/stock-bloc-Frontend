import { Router, Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import { db, auth } from './firebaseAdmin.js';
import { FieldValue } from 'firebase-admin/firestore';
import type { AgentApiKeyRecord, AgentIdentity, AgentApiScope } from '../src/types.js';

export const agentPlatformRouter = Router();

// Middleware to authenticate Stock Bloc humans (simplified for Phase 1 testing)
// In production, this would verify a Firebase ID token.
const authenticateHuman = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing human authentication token' });
  }
  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await auth.verifyIdToken(token);
    (req as any).user = decodedToken;
    next();
  } catch (error) {
    console.error('Human Auth error:', error);
    return res.status(401).json({ error: 'Invalid authentication token' });
  }
};

// Rate limiting
export const chatRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: { error: 'Too many requests', retryAfter: 60 },
  standardHeaders: true,
  legacyHeaders: false,
});

export const discussionRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 1,
  message: { error: 'Too many requests', retryAfter: 300 },
  standardHeaders: true,
  legacyHeaders: false,
});

export const globalApiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  message: { error: 'Too many requests' },
});

agentPlatformRouter.use(globalApiLimiter);

// Authentication Middleware for Agents
export const authenticateAgent = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer sb_live_')) {
    return res.status(401).json({ error: 'Invalid or missing API key format.' });
  }

  const token = authHeader.split('Bearer ')[1];
  const parts = token.split('_');
  if (parts.length !== 4 || parts[0] !== 'sb' || parts[1] !== 'live') {
    return res.status(401).json({ error: 'Invalid API key format.' });
  }

  const publicId = parts[2];
  const secret = parts[3];

  try {
    const keyRef = db.collection('api_keys').doc(publicId);
    const keySnap = await keyRef.get();

    if (!keySnap.exists) {
      return res.status(401).json({ error: 'API key not found or revoked.' });
    }

    const keyData = keySnap.data() as AgentApiKeyRecord;

    if (keyData.status !== 'active') {
      return res.status(401).json({ error: `API key is ${keyData.status}.` });
    }

    if (keyData.expiresAt && keyData.expiresAt.toDate() < new Date()) {
      return res.status(401).json({ error: 'API key has expired.' });
    }

    // Constant-time comparison
    const expectedHash = keyData.keyHash;
    const actualHash = crypto.createHash('sha256').update(secret).digest('hex');

    if (!crypto.timingSafeEqual(Buffer.from(expectedHash), Buffer.from(actualHash))) {
      return res.status(401).json({ error: 'Invalid API key.' });
    }

    // Check if agent is active
    const agentRef = db.collection('users').doc(keyData.agentId);
    const agentSnap = await agentRef.get();

    if (!agentSnap.exists) {
      return res.status(401).json({ error: 'Agent identity not found.' });
    }

    const agentData = agentSnap.data() as AgentIdentity;

    if (agentData.status !== 'active') {
      return res.status(401).json({ error: `Agent identity is ${agentData.status}.` });
    }

    // Update last used asynchronously
    keyRef.update({ lastUsedAt: FieldValue.serverTimestamp() }).catch(() => {});

    // Attach to request
    (req as any).agent = agentData;
    (req as any).agentKey = keyData;

    next();
  } catch (error) {
    console.error('Agent Auth error:', error);
    return res.status(500).json({ error: 'Internal server error during authentication.' });
  }
};

// Authorization Middleware for Scopes
export const requireScope = (scope: AgentApiScope) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const keyData: AgentApiKeyRecord = (req as any).agentKey;
    if (!keyData || !keyData.scopes.includes(scope)) {
      return res.status(403).json({ error: `Missing required scope: ${scope}` });
    }
    next();
  };
};

// POST /api/v1/agents/register (Requires human auth)
agentPlatformRouter.post('/register', authenticateHuman, async (req, res) => {
  try {
    const { handle, displayName, description, avatar } = req.body;
    const ownerUid = (req as any).user.uid;

    if (!handle || !displayName) {
      return res.status(400).json({ error: 'Handle and displayName are required.' });
    }

    // Basic handle validation
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(handle)) {
      return res.status(400).json({ error: 'Invalid handle format.' });
    }

    // Check if handle is taken (in production, use a transaction or unique constraint)
    const existing = await db.collection('users').where('handle', '==', handle).limit(1).get();
    if (!existing.empty) {
      return res.status(409).json({ error: 'Handle is already taken.' });
    }

    const agentRef = db.collection('users').doc();
    
    const newAgent: AgentIdentity & { authorType: 'agent', isAgent: boolean } = {
      agentId: agentRef.id,
      handle,
      displayName,
      description: description || '',
      avatar: avatar || '',
      ownerUid,
      verificationStatus: 'unverified',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      lastSeenAt: FieldValue.serverTimestamp(),
      status: 'active',
      authorType: 'agent', // Authoritative identity
      isAgent: true // Legacy compatibility
    };

    await agentRef.set(newAgent);
    console.log(`[SECURITY] Agent registered: ${agentRef.id} by ${ownerUid}`);

    return res.status(201).json(newAgent);
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/v1/agents/keys (Requires human auth)
agentPlatformRouter.post('/keys', authenticateHuman, async (req, res) => {
  try {
    const { agentId, scopes } = req.body;
    const ownerUid = (req as any).user.uid;

    if (!agentId || !scopes || !Array.isArray(scopes) || scopes.length === 0) {
      return res.status(400).json({ error: 'agentId and scopes array are required.' });
    }

    // Verify ownership
    const agentSnap = await db.collection('users').doc(agentId).get();
    if (!agentSnap.exists || agentSnap.data()?.ownerUid !== ownerUid) {
      return res.status(403).json({ error: 'You do not own this agent.' });
    }

    // Generate Key
    const publicId = crypto.randomBytes(8).toString('hex');
    const secret = crypto.randomBytes(32).toString('hex');
    const rawKey = `sb_live_${publicId}_${secret}`;
    const keyPrefix = secret.substring(0, 4) + '...';
    const keyHash = crypto.createHash('sha256').update(secret).digest('hex');

    const keyData: AgentApiKeyRecord = {
      keyId: publicId,
      agentId,
      ownerUid,
      keyPrefix,
      keyHash,
      scopes,
      createdAt: FieldValue.serverTimestamp(),
      lastUsedAt: null,
      expiresAt: null, // Could be configured in body
      revokedAt: null,
      status: 'active'
    };

    await db.collection('api_keys').doc(publicId).set(keyData);
    console.log(`[SECURITY] API key generated: ${publicId} for agent ${agentId} by ${ownerUid}`);

    // Return the RAW key ONLY ONCE.
    return res.status(201).json({
      keyId: publicId,
      key: rawKey,
      scopes
    });
  } catch (error) {
    console.error('Key generation error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/v1/agents/keys (Requires human auth)
agentPlatformRouter.get('/keys', authenticateHuman, async (req, res) => {
  try {
    const ownerUid = (req as any).user.uid;
    const agentId = req.query.agentId as string;
    
    let query = db.collection('api_keys').where('ownerUid', '==', ownerUid);
    if (agentId) {
      query = query.where('agentId', '==', agentId);
    }
    
    const keysSnap = await query.get();
    const keys = keysSnap.docs.map(doc => {
      const data = doc.data();
      // Omit keyHash for safety, even to owner
      const { keyHash, ...safeData } = data;
      return safeData;
    });
    
    return res.json(keys);
  } catch (error) {
    console.error('Key fetch error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/v1/agents/keys/:keyId/revoke (Requires human auth)
agentPlatformRouter.post('/keys/:keyId/revoke', authenticateHuman, async (req, res) => {
  try {
    const { keyId } = req.params;
    const ownerUid = (req as any).user.uid;

    const keyRef = db.collection('api_keys').doc(keyId);
    const keySnap = await keyRef.get();

    if (!keySnap.exists) {
      return res.status(404).json({ error: 'Key not found.' });
    }

    if (keySnap.data()?.ownerUid !== ownerUid) {
      return res.status(403).json({ error: 'You do not own this key.' });
    }

    if (keySnap.data()?.status === 'revoked') {
       return res.status(400).json({ error: 'Key is already revoked.' });
    }

    await keyRef.update({
      status: 'revoked',
      revokedAt: FieldValue.serverTimestamp()
    });
    
    console.log(`[SECURITY] API key revoked: ${keyId} by ${ownerUid}`);
    return res.json({ success: true, message: 'Key revoked.' });
  } catch (error) {
    console.error('Key revocation error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/v1/agents/keys/:keyId/rotate (Requires human auth)
agentPlatformRouter.post('/keys/:keyId/rotate', authenticateHuman, async (req, res) => {
    try {
        const { keyId } = req.params;
        const ownerUid = (req as any).user.uid;
    
        const keyRef = db.collection('api_keys').doc(keyId);
        const keySnap = await keyRef.get();
    
        if (!keySnap.exists) {
          return res.status(404).json({ error: 'Key not found.' });
        }
    
        const oldKeyData = keySnap.data() as AgentApiKeyRecord;
        if (oldKeyData.ownerUid !== ownerUid) {
          return res.status(403).json({ error: 'You do not own this key.' });
        }
    
        if (oldKeyData.status !== 'active') {
           return res.status(400).json({ error: `Cannot rotate a ${oldKeyData.status} key.` });
        }
        
        // Generate new secret
        const secret = crypto.randomBytes(32).toString('hex');
        const rawKey = `sb_live_${keyId}_${secret}`;
        const keyPrefix = secret.substring(0, 4) + '...';
        const keyHash = crypto.createHash('sha256').update(secret).digest('hex');
        
        await keyRef.update({
          keyPrefix,
          keyHash,
          lastUsedAt: null
        });
        
        console.log(`[SECURITY] API key rotated: ${keyId} by ${ownerUid}`);
        
        return res.json({
            keyId,
            key: rawKey
        });

    } catch (error) {
        console.error('Key rotation error:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});


// GET /api/v1/agents/me
agentPlatformRouter.get('/me', authenticateAgent, async (req, res) => {
  const agent: AgentIdentity = (req as any).agent;
  return res.json(agent);
});

// GET /api/v1/agents/:agentId
agentPlatformRouter.get('/:agentId', authenticateAgent, async (req, res) => {
    try {
        const snap = await db.collection('users').doc(req.params.agentId).get();
        if (!snap.exists) {
            return res.status(404).json({ error: 'Agent not found' });
        }
        
        const data = snap.data() as any;
        if (data.authorType !== 'agent' && data.authorType !== 'verified_agent') {
            return res.status(404).json({ error: 'Agent not found' });
        }
        
        // Return public profile
        return res.json({
            agentId: snap.id,
            handle: data.handle,
            displayName: data.displayName,
            description: data.description,
            avatar: data.avatar,
            verificationStatus: data.verificationStatus,
            createdAt: data.createdAt,
            status: data.status
        });
    } catch(err) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /stream (SSE) mounted at /api/v1/community/stream
export const communityStreamRouter = Router();
communityStreamRouter.use(globalApiLimiter);

communityStreamRouter.get('/stream', authenticateAgent, requireScope('community:read'), async (req, res) => {
    const agent = (req as any).agent;
    
    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); // flush the headers to establish SSE

    // Tell the client we are connected
    res.write(`data: ${JSON.stringify({ type: 'connected', agentId: agent.agentId })}\n\n`);
    
    const pingInterval = setInterval(() => {
        res.write(': ping\n\n');
    }, 15000);

    // Setup listeners (only listening to public data)
    const chatsUnsub = db.collection('chats')
        .orderBy('createdAt', 'desc')
        .limit(1)
        .onSnapshot(snapshot => {
            snapshot.docChanges().forEach(change => {
                if (change.type === 'added') {
                    // Send new chat event
                    const data = change.doc.data();
                    // Don't send our own events back to avoid echo (optional, but good practice)
                    res.write(`event: chat.created\ndata: ${JSON.stringify({ id: change.doc.id, ...data })}\n\n`);
                }
            });
        }, error => {
            console.error('SSE Chats Error:', error);
        });
        
    const discussionsUnsub = db.collection('discussions')
        .orderBy('createdAt', 'desc')
        .limit(1)
        .onSnapshot(snapshot => {
            snapshot.docChanges().forEach(change => {
                if (change.type === 'added') {
                    const data = change.doc.data();
                    res.write(`event: discussion.created\ndata: ${JSON.stringify({ id: change.doc.id, ...data })}\n\n`);
                }
            });
        }, error => {
            console.error('SSE Discussions Error:', error);
        });

    req.on('close', () => {
        clearInterval(pingInterval);
        chatsUnsub();
        discussionsUnsub();
        console.log(`[SSE] Connection closed for agent ${agent.agentId}`);
    });
});


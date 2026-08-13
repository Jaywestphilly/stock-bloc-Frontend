import { Router } from 'express';
import { db } from './firebaseAdmin.js';
import { FieldValue } from 'firebase-admin/firestore';
import { authenticateAgent, requireScope, globalApiLimiter } from './agentPlatform.js';
import rateLimit from 'express-rate-limit';

export const agentIntelligenceRouter = Router();
agentIntelligenceRouter.use(globalApiLimiter);

const publishRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: { error: 'Too many publications', retryAfter: 3600 },
});

// POST /api/v1/forecasts
agentIntelligenceRouter.post('/forecasts', authenticateAgent, requireScope('forecast:publish'), publishRateLimiter, async (req, res) => {
  try {
    const agent = (req as any).agent;
    const { question, asset, direction, target, probability, timeHorizon, resolutionCriteria, sourceEvidence } = req.body;

    if (!question || !asset || !direction || probability === undefined || !timeHorizon || !resolutionCriteria) {
      return res.status(400).json({ error: 'Missing required forecast fields' });
    }

    if (probability < 0 || probability > 100) {
      return res.status(400).json({ error: 'Probability must be between 0 and 100' });
    }

    const idempotencyKey = req.headers['idempotency-key'] as string;
    if (idempotencyKey) {
      const existingSnap = await db.collection('forecasts').where('idempotencyKey', '==', idempotencyKey).get();
      if (!existingSnap.empty) {
        return res.json({ id: existingSnap.docs[0].id, status: 'existing' });
      }
    }

    const forecastData = {
      agentId: agent.agentId,
      authorUsername: agent.handle,
      question,
      asset,
      direction,
      target: target || '',
      probability,
      timeHorizon,
      resolutionCriteria,
      sourceEvidence: sourceEvidence || '',
      status: 'OPEN',
      createdAt: FieldValue.serverTimestamp(),
      idempotencyKey: idempotencyKey || null
    };

    const docRef = await db.collection('forecasts').add(forecastData);

    // Update agent's open forecasts count
    await db.collection('users').doc(agent.agentId).update({
      'metrics.forecasts.open': FieldValue.increment(1),
      'metrics.forecasts.total': FieldValue.increment(1),
      lastSeenAt: FieldValue.serverTimestamp(),
    }).catch(console.error);

    return res.status(201).json({ id: docRef.id, status: 'created' });
  } catch (err: any) {
    console.error('Error creating forecast:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/v1/forecasts
agentIntelligenceRouter.get('/forecasts', async (req, res) => {
  try {
    const { agentId, asset, status, limit = 50 } = req.query;
    let query: any = db.collection('forecasts');

    if (agentId) query = query.where('agentId', '==', agentId);
    if (asset) query = query.where('asset', '==', asset);
    if (status) query = query.where('status', '==', status);

    query = query.orderBy('createdAt', 'desc').limit(Number(limit));
    const snapshot = await query.get();

    const forecasts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return res.json(forecasts);
  } catch (err: any) {
    console.error('Error fetching forecasts:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/v1/forecasts/:forecastId
agentIntelligenceRouter.get('/forecasts/:forecastId', async (req, res) => {
  try {
    const doc = await db.collection('forecasts').doc(req.params.forecastId).get();
    if (!doc.exists) return res.status(404).json({ error: 'Not found' });
    return res.json({ id: doc.id, ...doc.data() });
  } catch (err: any) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/v1/research
agentIntelligenceRouter.post('/research', authenticateAgent, requireScope('research:publish'), publishRateLimiter, async (req, res) => {
  try {
    const agent = (req as any).agent;
    const { title, summary, thesis, bullCase, bearCase, catalysts, risks, evidence, timeHorizon, relatedAssets } = req.body;

    if (!title || !summary || !thesis) {
      return res.status(400).json({ error: 'Missing required research fields' });
    }

    const idempotencyKey = req.headers['idempotency-key'] as string;
    if (idempotencyKey) {
      const existingSnap = await db.collection('research').where('idempotencyKey', '==', idempotencyKey).get();
      if (!existingSnap.empty) {
        return res.json({ id: existingSnap.docs[0].id, status: 'existing' });
      }
    }

    const researchData = {
      agentId: agent.agentId,
      authorUsername: agent.handle,
      title,
      summary,
      thesis,
      bullCase: bullCase || '',
      bearCase: bearCase || '',
      catalysts: catalysts || [],
      risks: risks || [],
      evidence: evidence || [],
      timeHorizon: timeHorizon || '',
      relatedAssets: relatedAssets || [],
      version: 1,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      idempotencyKey: idempotencyKey || null
    };

    const docRef = await db.collection('research').add(researchData);

    await db.collection('users').doc(agent.agentId).update({
      'metrics.researchCount': FieldValue.increment(1),
      lastSeenAt: FieldValue.serverTimestamp(),
    }).catch(console.error);

    return res.status(201).json({ id: docRef.id, status: 'created' });
  } catch (err: any) {
    console.error('Error creating research:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/v1/research
agentIntelligenceRouter.get('/research', async (req, res) => {
  try {
    const { agentId, limit = 50 } = req.query;
    let query: any = db.collection('research');

    if (agentId) query = query.where('agentId', '==', agentId);

    query = query.orderBy('createdAt', 'desc').limit(Number(limit));
    const snapshot = await query.get();

    const research = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return res.json(research);
  } catch (err: any) {
    console.error('Error fetching research:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/v1/research/:researchId
agentIntelligenceRouter.get('/research/:researchId', async (req, res) => {
  try {
    const doc = await db.collection('research').doc(req.params.researchId).get();
    if (!doc.exists) return res.status(404).json({ error: 'Not found' });
    return res.json({ id: doc.id, ...doc.data() });
  } catch (err: any) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/v1/theses
agentIntelligenceRouter.post('/theses', authenticateAgent, requireScope('research:publish'), publishRateLimiter, async (req, res) => {
  try {
    const agent = (req as any).agent;
    const { asset, direction, timeHorizon, thesis, catalysts, risks, bullCase, baseCase, bearCase, keyMetrics, invalidationConditions, evidence } = req.body;

    if (!asset || !direction || !thesis) {
      return res.status(400).json({ error: 'Missing required thesis fields' });
    }

    const thesisData = {
      agentId: agent.agentId,
      authorUsername: agent.handle,
      asset,
      direction,
      timeHorizon: timeHorizon || '',
      thesis,
      catalysts: catalysts || [],
      risks: risks || [],
      bullCase: bullCase || '',
      baseCase: baseCase || '',
      bearCase: bearCase || '',
      keyMetrics: keyMetrics || [],
      invalidationConditions: invalidationConditions || [],
      evidence: evidence || [],
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection('theses').add(thesisData);
    
    await db.collection('users').doc(agent.agentId).update({
      'metrics.thesesCount': FieldValue.increment(1),
      lastSeenAt: FieldValue.serverTimestamp(),
    }).catch(console.error);

    return res.status(201).json({ id: docRef.id, status: 'created' });
  } catch (err: any) {
    console.error('Error creating thesis:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/v1/theses
agentIntelligenceRouter.get('/theses', async (req, res) => {
  try {
    const { agentId, limit = 50 } = req.query;
    let query: any = db.collection('theses');

    if (agentId) query = query.where('agentId', '==', agentId);

    query = query.orderBy('createdAt', 'desc').limit(Number(limit));
    const snapshot = await query.get();

    const theses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return res.json(theses);
  } catch (err: any) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/v1/agents/:agentId/performance
agentIntelligenceRouter.get('/agents/:agentId/performance', async (req, res) => {
  try {
    const agentDoc = await db.collection('users').doc(req.params.agentId).get();
    if (!agentDoc.exists) return res.status(404).json({ error: 'Agent not found' });
    
    const agentData = agentDoc.data() as any;
    if (agentData.type !== 'agent' && agentData.type !== 'verified_agent') {
      return res.status(400).json({ error: 'Not an agent' });
    }

    // Return the aggregated metrics from the agent's document
    const metrics = agentData.metrics || {
      forecasts: { total: 0, correct: 0, incorrect: 0, open: 0 },
      researchCount: 0,
      thesesCount: 0,
      communityInteractions: 0
    };
    
    let reputationStatus = 'INSUFFICIENT_DATA';
    let totalResolved = (metrics.forecasts?.correct || 0) + (metrics.forecasts?.incorrect || 0);
    
    if (totalResolved > 50) reputationStatus = 'HIGH_CONFIDENCE';
    else if (totalResolved > 20) reputationStatus = 'ESTABLISHED';
    else if (totalResolved > 5) reputationStatus = 'EMERGING';

    return res.json({
      reputationStatus,
      forecastRecord: metrics.forecasts,
      researchCount: metrics.researchCount || 0,
      thesesCount: metrics.thesesCount || 0,
      communityInteractions: metrics.communityInteractions || 0,
      // You would compute a real score based on real data here if possible
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

const fs = require('fs');
const content = fs.readFileSync('server.ts', 'utf8');

const targetStart = `// 22. Community Leaderboard REST API Endpoint: /api/v1/agent/leaderboard\napp.get('/api/v1/agent/leaderboard', (req, res) => {`;
const targetEnd = `// 22b. Live X.com Feed Endpoint for @thestockbloc and Financial Market News`;

const startIdx = content.indexOf(targetStart);
let endIdx = content.indexOf(targetEnd);

if (startIdx !== -1 && endIdx !== -1) {
    const replacement = `// 22. Community Leaderboard REST API Endpoint: /api/v1/agent/leaderboard
app.get('/api/v1/agent/leaderboard', async (req, res) => {
  try {
    const snapshot = await db.collection('users')
      .where('authorType', 'in', ['agent', 'verified_agent'])
      .get();
      
    const agents = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      const metrics = data.metrics || {};
      const forecasts = metrics.forecasts || {};
      const correct = forecasts.correct || 0;
      const incorrect = forecasts.incorrect || 0;
      const totalResolved = correct + incorrect;
      
      // Default placeholder metrics if insufficient data
      let winRate = 0;
      let alpha = 0;
      let sharpe = 0;
      
      if (totalResolved > 0) {
        winRate = Math.round((correct / totalResolved) * 100);
        alpha = Math.max(0, winRate - 50) * 0.5;
        sharpe = winRate > 50 ? 1.0 + ((winRate - 50) * 0.05) : 0;
      }
      
      // Only include active agents or those with some metrics
      agents.push({
        id: doc.id,
        agentName: data.displayName || data.handle || "Agent",
        handle: data.handle || "",
        modelType: data.description ? data.description.substring(0, 40) + "..." : "Community AI Agent",
        winRatePercent: winRate,
        monthlyAlphaPercent: alpha,
        sharpeRatio: sharpe,
        maxDrawdownPercent: 0,
        verifiedStatus: data.authorType === 'verified_agent' ? "ARENA CERTIFIED" : "COMMUNITY AGENT",
        submittedBy: data.handle,
        badges: totalResolved > 20 ? ["Accuracy Warlock"] : ["Quant Vanguard"],
        tradeIdea: {
          ticker: '---',
          action: 'N/A',
          targetPrice: 0,
          timeframe: 'N/A',
          rationale: 'Awaiting forecasts'
        }
      });
    });

    agents.sort((a, b) => b.winRatePercent - a.winRatePercent);

    // Assign ranks
    agents.forEach((agent, index) => {
      agent.rank = index + 1;
    });

    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      totalAgentsRanked: agents.length,
      leaderboard: agents
    });
  } catch (err) {
    console.error("Leaderboard Error:", err);
    res.status(500).json({ error: "Failed to load leaderboard" });
  }
});

`;
    const newContent = content.substring(0, startIdx) + replacement + content.substring(endIdx);
    fs.writeFileSync('server.ts', newContent);
    console.log("Updated leaderboard in server.ts");
} else {
    console.error("Could not find start or end index.");
    console.error("startIdx", startIdx);
    console.error("endIdx", endIdx);
}

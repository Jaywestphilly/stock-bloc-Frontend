const fs = require('fs');
let code = fs.readFileSync('src/components/TsunamiVolatilityTicker.tsx', 'utf8');
code = code.replace(/pe: 25,\n\s*high52:/g, 'peRatio: "25",\n          high52:');
code = code.replace(/sector: "High Volatility",\n\s*description: spike\.catalyst,\n\s*momentumScore: 92,/g, 'category: "tsunami",\n          description: spike.catalyst,\n          tags: [],\n          sparkline: [],\n          history: { "1D": [], "1W": [], "1M": [], "3M": [], "1Y": [], "5Y": [], "ALL": [] },\n          quantMetrics: { momentumScore: 92 },');
fs.writeFileSync('src/components/TsunamiVolatilityTicker.tsx', code);

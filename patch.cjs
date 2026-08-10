const fs = require('fs');

let file = fs.readFileSync('src/features/research/WarGovUfoHub.tsx', 'utf8');

const targetContent = `  const handleSelectTicker = (tickerSymbol: string) => {
    triggerHaptic("selection");
    if (onSelectStock && allStocks) {
      const match = allStocks.find((s) => s.symbol.toUpperCase() === tickerSymbol.toUpperCase());
      if (match) {
        onSelectStock(match);
      } else {
        // Fallback ticker creation if not in default mock set
        onSelectStock({
          symbol: tickerSymbol.toUpperCase(),
          name: tickerSymbol,
          price: 100,
          change: 0,
          changePercent: 0,
          volume: "1.2M",
          marketCap: "10B",
          peRatio: 20,
          high52: 110,
          low52: 90,
          avgVolume: "1M",
          dividendYield: 1.5,
          beta: 1.0,
          eps: 5.0,
          nextEarnings: "N/A",
          analystRating: "Buy",
          targetPrice: 120,
          sector: "Aerospace & Defense",
          industry: "Defense Prime",
          description: "Defense contractor tracking.",
        });
      }
    }
  };`;

const replacementContent = `  const handleSelectTicker = (tickerSymbol: string) => {
    triggerHaptic("selection");
    let query = tickerSymbol;
    if (tickerSymbol === "ANDURIL") {
      query = "ANDURIL";
    }
    window.open(\`https://finance.yahoo.com/quote/\${query}\`, "_blank", "noopener,noreferrer");
  };`;

if(file.includes(targetContent)) {
  file = file.replace(targetContent, replacementContent);
  fs.writeFileSync('src/features/research/WarGovUfoHub.tsx', file);
  console.log("Replaced successfully");
} else {
  console.log("Could not find target content");
  
  // Let's use a regex instead
  const regex = /const handleSelectTicker = \(tickerSymbol: string\) => \{[\s\S]*?\};/;
  if(regex.test(file)) {
      file = file.replace(regex, replacementContent);
      fs.writeFileSync('src/features/research/WarGovUfoHub.tsx', file);
      console.log("Replaced successfully via regex");
  } else {
      console.log("Could not find target content via regex either");
  }
}

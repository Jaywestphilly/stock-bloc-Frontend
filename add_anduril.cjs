const fs = require('fs');

let serverFile = fs.readFileSync('server.ts', 'utf8');

const andurilEntry = `
      {
        ticker: "ANDURIL",
        name: "Anduril Industries",
        price: 0,
        changePercent: 0,
        marketCap: "$14.0B (Private)",
        peRatio: 0,
        dividendYield: 0,
        dodBacklogBillions: 1.5,
        ytdContractAwardsMillions: 1200,
        primaryBranch: "US SOCOM / INDOPACOM",
        clearanceLevel: "TOP SECRET // SCI",
        domain: "Autonomous Swarms",
        uapTechRole: "Lattice OS C2 software, Ghost Shark AUVs, Roadrunner autonomous interceptors.",
        investmentThesis: "Silicon Valley-backed disruptor fundamentally changing DoD procurement from hardware platforms to software-defined autonomous attritable mass.",
        analystRating: "Private (Series F)"
      },`;

serverFile = serverFile.replace('const defenseWatchlist = [', 'const defenseWatchlist = [' + andurilEntry);
fs.writeFileSync('server.ts', serverFile);

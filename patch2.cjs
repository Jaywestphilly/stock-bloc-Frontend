const fs = require('fs');

let file = fs.readFileSync('src/features/research/WarGovUfoHub.tsx', 'utf8');

const replacement = `.sort((a, b) => {
      if (a.ticker === "ANDURIL") return -1;
      if (b.ticker === "ANDURIL") return 1;
      if (watchlistSortKey === "backlog") return b.dodBacklogBillions - a.dodBacklogBillions;
      if (watchlistSortKey === "change") return b.changePercent - a.changePercent;
      if (watchlistSortKey === "awards") return b.ytdContractAwardsMillions - a.ytdContractAwardsMillions;
      return parseFloat(b.marketCap.replace(/[^0-9.]/g, "")) - parseFloat(a.marketCap.replace(/[^0-9.]/g, ""));
    });`;

const regex = /\.sort\(\(a, b\) => \{[\s\S]*?\}\);/;
file = file.replace(regex, replacement);
fs.writeFileSync('src/features/research/WarGovUfoHub.tsx', file);

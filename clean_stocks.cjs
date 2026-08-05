const fs = require('fs');
let code = fs.readFileSync('src/data/stocks.ts', 'utf8');
code = `import { StockTicker, StockNews } from "../types";\nexport const INITIAL_STOCKS: StockTicker[] = [];\n` + code.substring(code.indexOf('export const STOCK_NEWS_FEED'));
fs.writeFileSync('src/data/stocks.ts', code);

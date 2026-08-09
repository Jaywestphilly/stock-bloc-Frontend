import { MarketDataService } from "./src/services/marketDataService";
MarketDataService.refreshMarketData().then(() => console.log('Done')).catch(console.error);

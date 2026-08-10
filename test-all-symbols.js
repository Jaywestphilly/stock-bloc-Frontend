const today = new Date();
const past = new Date();
past.setDate(today.getDate() - 7);
const toDate = today.toISOString().split('T')[0];
const fromDate = past.toISOString().split('T')[0];

const WATCHLIST_SYMBOLS = [
  "SPCX", "NVDA", "AAPL", "TSLA", "PLTR", "MSFT", "VST", "ASTS",
  "POET", "QUBT", "XSD", "HBM", "LITE", "CRWV", "BE", "SNDK",
  "AMD", "GOOGL", "MU", "CORZ", "BTC-USD", "META", "TSM", "^NYA",
  "SPY", "^GSPC", "AMZN", "NVT", "AIPO", "QQQ", "APLD", "^IXIC",
  "MOD", "INTC", "HAWK", "SMH", "SOXX", "POWL", "ASML"
];

async function main() {
  for (const sym of WATCHLIST_SYMBOLS) {
    const url = `https://finnhub.io/api/v1/company-news?symbol=${encodeURIComponent(sym)}&from=${fromDate}&to=${toDate}&token=${process.env.FINNHUB_API_KEY}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      const count = Array.isArray(data) ? data.length : 0;
      if (count === 0) {
        console.log(`[ZERO ARTICLES] ${sym}`);
      }
    } catch(e) {
      console.log(`[ERROR] ${sym}: ${e.message}`);
    }
  }
  console.log("Done checking symbols");
}
main();

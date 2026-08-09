import { computeDeterministicSignal } from "./src/utils/signalCalculator";
import fs from "fs";

const data = JSON.parse(fs.readFileSync("./market_watchlist_data.json", "utf-8"));
for (const stock of data.watchlist) {
  const sig = computeDeterministicSignal(stock);
  console.log(stock.symbol, sig.score);
}

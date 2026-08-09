import { computeDeterministicSignal } from "./src/utils/signalCalculator";
import fs from "fs";

const data = JSON.parse(fs.readFileSync("./market_watchlist_data.json", "utf-8"));
const sig = computeDeterministicSignal(data.watchlist[0]);
console.log(sig);

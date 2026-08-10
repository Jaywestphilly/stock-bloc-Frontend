const today = new Date();
const past = new Date();
past.setDate(today.getDate() - 7);
const toDate = today.toISOString().split('T')[0];
const fromDate = past.toISOString().split('T')[0];

async function checkSymbol(sym) {
  const url = `https://finnhub.io/api/v1/company-news?symbol=${sym}&from=${fromDate}&to=${toDate}&token=${process.env.FINNHUB_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  console.log(sym, Array.isArray(data) ? data.length : data);
  if (Array.isArray(data) && data.length > 0) {
    console.log("Sample:", data[0].headline, data[0].source);
  }
}

async function main() {
  await checkSymbol("SPCX");
  await checkSymbol("DXYZ");
  await checkSymbol("SPY");
}
main();

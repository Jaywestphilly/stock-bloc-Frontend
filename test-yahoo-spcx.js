async function testYahoo(sym) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?interval=1d&range=5d`;
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  console.log(sym, res.status);
  if (res.ok) {
    const data = await res.json();
    console.log(sym, data.chart?.result?.[0]?.meta?.regularMarketPrice);
  }
}
async function main() {
  await testYahoo('SPCX');
  await testYahoo('DXYZ');
}
main();

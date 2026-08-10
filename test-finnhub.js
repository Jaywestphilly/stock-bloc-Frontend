const toDate = new Date().toISOString().split('T')[0];
const past = new Date(); past.setDate(past.getDate() - 7);
const fromDate = past.toISOString().split('T')[0];
const url = `https://finnhub.io/api/v1/company-news?symbol=AAPL&from=${fromDate}&to=${toDate}&token=${process.env.FINNHUB_API_KEY}`;
fetch(url).then(res => res.json()).then(data => console.log(data.slice(0, 1))).catch(console.error);

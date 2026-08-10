const apiKey = process.env.FINNHUB_API_KEY;

async function fetchFinnhubNewsForSymbol(symbol, apiKey) {
  try {
    const today = new Date();
    const past = new Date();
    past.setDate(today.getDate() - 7);
    const toDate = today.toISOString().split('T')[0];
    const fromDate = past.toISOString().split('T')[0];

    const url = `https://finnhub.io/api/v1/company-news?symbol=${encodeURIComponent(symbol)}&from=${fromDate}&to=${toDate}&token=${encodeURIComponent(apiKey)}`;
    console.log("Fetching URL:", url);

    const res = await fetch(url, {
      headers: { 'Accept': 'application/json' }
    });

    console.log("Status:", res.status);
    if (!res.ok) return null;
    const data = await res.json();
    console.log("Length:", Array.isArray(data) ? data.length : typeof data);
    if (!Array.isArray(data)) return null;

    return data.slice(0, 3).map(item => ({
      title: item.headline,
      source: item.source,
      time: item.datetime ? new Date(item.datetime * 1000).toISOString() : undefined,
      url: item.url
    }));
  } catch (e) {
    console.error(e);
    return null;
  }
}

fetchFinnhubNewsForSymbol('SPCX', apiKey).then(console.log);

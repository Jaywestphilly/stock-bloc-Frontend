const fs = require('fs');
let server = fs.readFileSync('server.ts', 'utf-8');

const newApis = `
// --- Macro & Space Integration Endpoints ---

app.get('/api/macro/real-estate', async (req, res) => {
  try {
    const apiKey = process.env.FRED_API_KEY;
    if (!apiKey) {
      return res.status(401).json({ error: 'FRED_API_KEY is not configured.' });
    }
    
    // Fetch Mortgage Rates (MORTGAGE30US)
    const mortgageRes = await fetch(\`https://api.stlouisfed.org/fred/series/observations?series_id=MORTGAGE30US&api_key=\${apiKey}&file_type=json&sort_order=desc&limit=12\`);
    const mortgageData = await mortgageRes.json();
    
    // Fetch Housing Starts (HOUST)
    const houstRes = await fetch(\`https://api.stlouisfed.org/fred/series/observations?series_id=HOUST&api_key=\${apiKey}&file_type=json&sort_order=desc&limit=12\`);
    const houstData = await houstRes.json();

    // Fetch Case-Shiller Index (CSUSHPINSA)
    const csRes = await fetch(\`https://api.stlouisfed.org/fred/series/observations?series_id=CSUSHPINSA&api_key=\${apiKey}&file_type=json&sort_order=desc&limit=12\`);
    const csData = await csRes.json();

    res.json({
      mortgage: mortgageData.observations || [],
      housingStarts: houstData.observations || [],
      caseShiller: csData.observations || []
    });
  } catch (e) {
    console.error('Error fetching real estate macro data:', e);
    res.status(500).json({ error: 'Failed to fetch real estate data' });
  }
});

app.get('/api/macro/credit', async (req, res) => {
  try {
    const apiKey = process.env.FRED_API_KEY;
    if (!apiKey) {
      return res.status(401).json({ error: 'FRED_API_KEY is not configured.' });
    }
    
    // Fetch Delinquency Rate on Credit Card Loans (DRCCLACBS)
    const delinqRes = await fetch(\`https://api.stlouisfed.org/fred/series/observations?series_id=DRCCLACBS&api_key=\${apiKey}&file_type=json&sort_order=desc&limit=12\`);
    const delinqData = await delinqRes.json();

    // Fetch Commercial Bank Interest Rate on Credit Cards (TERMCBCCALLNS)
    const rateRes = await fetch(\`https://api.stlouisfed.org/fred/series/observations?series_id=TERMCBCCALLNS&api_key=\${apiKey}&file_type=json&sort_order=desc&limit=12\`);
    const rateData = await rateRes.json();

    res.json({
      delinquencies: delinqData.observations || [],
      interestRates: rateData.observations || []
    });
  } catch (e) {
    console.error('Error fetching credit macro data:', e);
    res.status(500).json({ error: 'Failed to fetch credit data' });
  }
});

app.get('/api/space/news', async (req, res) => {
  try {
    // Spaceflight News API v4
    const newsRes = await fetch('https://api.spaceflightnewsapi.net/v4/articles?limit=15');
    const newsData = await newsRes.json();
    res.json(newsData.results || []);
  } catch (e) {
    console.error('Error fetching space news:', e);
    res.status(500).json({ error: 'Failed to fetch space news' });
  }
});

app.get('/api/space/launches', async (req, res) => {
  try {
    // SpaceX API v4
    const upcomingRes = await fetch('https://api.spacexdata.com/v4/launches/upcoming');
    const upcomingData = await upcomingRes.json();
    
    const pastRes = await fetch('https://api.spacexdata.com/v4/launches/past');
    const pastData = await pastRes.json();
    
    res.json({
      upcoming: upcomingData || [],
      past: (pastData || []).slice(-10).reverse() // get 10 most recent past launches
    });
  } catch (e) {
    console.error('Error fetching spacex launches:', e);
    res.status(500).json({ error: 'Failed to fetch spacex launches' });
  }
});

`;

server = server.replace("// Proxy Endpoints", newApis + "\n// Proxy Endpoints");

fs.writeFileSync('server.ts', server);
console.log("Added new API endpoints to server.ts");

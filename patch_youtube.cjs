const fs = require('fs');
let server = fs.readFileSync('server.ts', 'utf-8');

const youtubeEndpoint = `
// --- Education Integration Endpoints ---

app.get('/api/education/youtube-courses', async (req, res) => {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return res.status(401).json({ error: 'YOUTUBE_API_KEY is not configured.' });
    }
    
    // We can fetch playlists from MIT OpenCourseWare (Channel ID: UCEBb1b_L6zDS3xTUrIALZOw)
    const mitId = 'UCEBb1b_L6zDS3xTUrIALZOw';
    
    // Fetch latest playlists
    const ytRes = await fetch(\`https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&channelId=\${mitId}&maxResults=10&key=\${apiKey}\`);
    const data = await ytRes.json();
    
    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    res.json(data.items || []);
  } catch (e) {
    console.error('Error fetching youtube data:', e);
    res.status(500).json({ error: 'Failed to fetch youtube data' });
  }
});
`;

server = server.replace("// Proxy Endpoints", youtubeEndpoint + "\n// Proxy Endpoints");
fs.writeFileSync('server.ts', server);
console.log("Patched server.ts with youtube endpoint");

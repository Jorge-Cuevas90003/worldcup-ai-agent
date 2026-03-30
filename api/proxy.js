// Proxy to Polymarket Gamma API — avoids CORS in production
// Usage: /api/proxy?path=events/slug/2026-fifa-world-cup-winner-595
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const path = req.query.path;
  if (!path) {
    return res.status(400).json({ error: 'Missing path query parameter' });
  }

  const targetUrl = `https://gamma-api.polymarket.com/${path}`;

  try {
    const response = await fetch(targetUrl, {
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `Polymarket API returned ${response.status}` });
    }

    const data = await response.json();
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
    res.json(data);
  } catch (err) {
    console.error('Proxy error:', err.message);
    res.status(500).json({ error: 'Proxy fetch failed' });
  }
};

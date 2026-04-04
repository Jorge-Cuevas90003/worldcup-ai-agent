const { fetchWorldCupMarkets } = require('./_lib/polymarket');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const markets = await fetchWorldCupMarkets();
    res.json({ markets });
  } catch (err) {
    console.error('getMarkets error:', err);
    res.status(500).json({ error: 'Failed to fetch markets' });
  }
};

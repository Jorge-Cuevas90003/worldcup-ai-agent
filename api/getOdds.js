const { fetchWinnerOdds } = require('./_lib/polymarket');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const teams = await fetchWinnerOdds();
    res.json({ source: 'live', teams });
  } catch (err) {
    console.error('getOdds error:', err);
    res.status(500).json({ error: 'Failed to fetch odds' });
  }
};

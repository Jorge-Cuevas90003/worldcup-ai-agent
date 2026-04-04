const { fetchWinnerOdds } = require('./_lib/polymarket');
const { ALERT_THRESHOLD, ALERT_SEVERITY_MULTIPLIER, TEAM_FLAGS } = require('./_lib/config');

// In-memory cache for detecting changes between calls
let lastOdds = null;
let alerts = [];

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const limit = parseInt(req.query?.limit, 10) || 20;
    res.json({ alerts: alerts.slice(0, limit) });
  } catch (err) {
    console.error('getAlerts error:', err);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
};

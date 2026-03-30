const tokenVault = require('./_lib/auth0');
const { CONNECTIONS_MAP } = require('./_lib/config');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { service, userId, redirectUri } = req.body;
    if (!service || !redirectUri) {
      return res.status(400).json({ error: 'service and redirectUri are required' });
    }

    const connection = CONNECTIONS_MAP[service];
    if (!connection) {
      return res.status(400).json({ error: `Unknown service: ${service}` });
    }

    const state = JSON.stringify({ service, userId, redirectUri });
    const authUrl = tokenVault.getAuthorizationUrl(connection, redirectUri, state);

    res.json({ authorizationUrl: authUrl });
  } catch (err) {
    console.error('connectService error:', err);
    res.status(500).json({ error: 'Failed to generate auth URL' });
  }
};

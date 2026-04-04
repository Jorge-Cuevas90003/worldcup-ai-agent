module.exports = async function handler(req, res) {
  try {
    const { code, state } = req.query;
    if (!code || !state) {
      return res.status(400).json({ error: 'Missing code or state' });
    }

    let parsed;
    try {
      parsed = JSON.parse(state);
    } catch {
      return res.status(400).json({ error: 'Invalid state parameter' });
    }

    const { service } = parsed;

    // Redirect back to the app with connection status
    const appUrl = process.env.APP_URL || 'https://worldcup-agent.vercel.app';
    res.redirect(302, `${appUrl}/connections?connected=${service}`);
  } catch (err) {
    console.error('authCallback error:', err);
    res.status(500).json({ error: 'Callback failed' });
  }
};

const admin = require('firebase-admin');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { onRequest } = require('firebase-functions/v2/https');

admin.initializeApp();

const { fetchWinnerOdds, fetchWorldCupMarkets } = require('./services/polymarket');
const { getCurrentOdds, detectOddsChanges, saveOdds, saveAlerts, getRecentAlerts } = require('./services/alerts');
const { sendAlertEmail, postSlackAlert } = require('./services/notifications');
const tokenVault = require('./services/auth0');
const { COLLECTIONS, CONNECTIONS_MAP } = require('./config');

// 1. checkOdds — Scheduled every 10 minutes
exports.checkOdds = onSchedule('every 10 minutes', async () => {
  try {
    const [currentOdds, newOdds] = await Promise.all([
      getCurrentOdds(),
      fetchWinnerOdds(),
    ]);

    await saveOdds(newOdds);

    const alerts = detectOddsChanges(currentOdds, newOdds);
    if (alerts.length === 0) {
      console.log('No significant odds changes detected');
      return;
    }

    await saveAlerts(alerts);
    console.log(`Created ${alerts.length} alerts`);

    const usersSnap = await admin.firestore()
      .collection(COLLECTIONS.USERS)
      .where('notifications.enabled', '==', true)
      .get();

    for (const userDoc of usersSnap.docs) {
      const user = userDoc.data();
      const userId = userDoc.id;

      for (const alert of alerts) {
        if (alert.severity < (user.notifications?.minSeverity || 0)) continue;

        if (user.connections?.gmail) {
          try {
            await sendAlertEmail(userId, alert);
          } catch (err) {
            console.error(`Gmail failed for ${userId}:`, err.message);
          }
        }

        if (user.connections?.slack) {
          try {
            await postSlackAlert(userId, alert, user.slackChannel);
          } catch (err) {
            console.error(`Slack failed for ${userId}:`, err.message);
          }
        }
      }
    }
  } catch (err) {
    console.error('checkOdds failed:', err);
  }
});

// 2. getOdds — HTTP GET
exports.getOdds = onRequest({ cors: true }, async (req, res) => {
  try {
    const currentOdds = await getCurrentOdds();
    const teams = Object.values(currentOdds).sort((a, b) => b.odds - a.odds);

    if (teams.length === 0) {
      const liveOdds = await fetchWinnerOdds();
      return res.json({ source: 'live', teams: liveOdds });
    }

    res.json({ source: 'cache', teams });
  } catch (err) {
    console.error('getOdds error:', err);
    res.status(500).json({ error: 'Failed to fetch odds' });
  }
});

// 3. getAlerts — HTTP GET (?limit=20)
exports.getAlerts = onRequest({ cors: true }, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 20;
    const alerts = await getRecentAlerts(limit);
    res.json({ alerts });
  } catch (err) {
    console.error('getAlerts error:', err);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// 4. getMarkets — HTTP GET
exports.getMarkets = onRequest({ cors: true }, async (req, res) => {
  try {
    const markets = await fetchWorldCupMarkets();
    res.json({ markets });
  } catch (err) {
    console.error('getMarkets error:', err);
    res.status(500).json({ error: 'Failed to fetch markets' });
  }
});

// 5. connectService — HTTP POST ({ service, userId, redirectUri })
exports.connectService = onRequest({ cors: true }, async (req, res) => {
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
});

// 6. authCallback — HTTP GET (?code=X&state=Y)
exports.authCallback = onRequest({ cors: true }, async (req, res) => {
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

    const { service, userId } = parsed;

    if (userId) {
      await admin.firestore()
        .collection(COLLECTIONS.USERS)
        .doc(userId)
        .set(
          { connections: { [service]: true } },
          { merge: true }
        );
    }

    const appUrl = 'https://worldcup-agent.web.app';
    res.redirect(`${appUrl}/connections?connected=${service}`);
  } catch (err) {
    console.error('authCallback error:', err);
    res.status(500).json({ error: 'Callback failed' });
  }
});

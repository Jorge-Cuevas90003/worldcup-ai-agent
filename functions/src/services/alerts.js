const admin = require('firebase-admin');
const { COLLECTIONS, ALERT_THRESHOLD, ALERT_SEVERITY_MULTIPLIER, TEAM_FLAGS } = require('../config');

const db = () => admin.firestore();

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function getCurrentOdds() {
  const snapshot = await db().collection(COLLECTIONS.ODDS).get();
  const odds = {};
  snapshot.forEach((doc) => {
    odds[doc.id] = doc.data();
  });
  return odds;
}

function detectOddsChanges(currentOdds, newOdds) {
  const alerts = [];

  for (const team of newOdds) {
    const slug = slugify(team.team);
    const prev = currentOdds[slug];
    if (!prev) continue;

    const change = team.odds - prev.odds;
    const absChange = Math.abs(change);

    if (absChange >= ALERT_THRESHOLD) {
      const severity = Math.min(100, Math.round(absChange * ALERT_SEVERITY_MULTIPLIER));
      const type = change > 0 ? 'hot' : 'drop';
      const direction = change > 0 ? 'surged' : 'dropped';

      alerts.push({
        team: team.team,
        flag: TEAM_FLAGS[team.team] || '🏳️',
        previousOdds: prev.odds,
        currentOdds: team.odds,
        change: Math.round(change * 100) / 100,
        type,
        severity,
        message: `${team.team} odds ${direction} ${absChange.toFixed(1)}%`,
        detail: `${prev.odds.toFixed(1)}% → ${team.odds.toFixed(1)}% | Volume: $${(team.volume / 1e6).toFixed(1)}M`,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        read: false,
      });
    }
  }

  return alerts;
}

async function saveOdds(teams) {
  const batch = db().batch();
  const now = admin.firestore.FieldValue.serverTimestamp();

  for (const team of teams) {
    const slug = slugify(team.team);

    // Update current odds
    batch.set(db().collection(COLLECTIONS.ODDS).doc(slug), {
      team: team.team,
      flag: team.flag,
      odds: team.odds,
      volume: team.volume,
      liquidity: team.liquidity,
      lastUpdated: now,
    });

    // Append to history
    batch.set(db().collection(COLLECTIONS.ODDS_HISTORY).doc(), {
      team: team.team,
      odds: team.odds,
      volume: team.volume,
      timestamp: now,
    });
  }

  await batch.commit();
}

async function saveAlerts(alerts) {
  const batch = db().batch();
  for (const alert of alerts) {
    batch.set(db().collection(COLLECTIONS.ALERTS).doc(), alert);
  }
  await batch.commit();
  return alerts;
}

async function getRecentAlerts(limit = 20) {
  const snapshot = await db()
    .collection(COLLECTIONS.ALERTS)
    .orderBy('timestamp', 'desc')
    .limit(limit)
    .get();

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

module.exports = { getCurrentOdds, detectOddsChanges, saveOdds, saveAlerts, getRecentAlerts, slugify };

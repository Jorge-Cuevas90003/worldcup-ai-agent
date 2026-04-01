const { fetchWinnerOdds } = require('../_lib/polymarket');
const { sendAlertEmail, postSlackAlert } = require('../_lib/notifications');
const { supabase } = require('../_lib/supabase');
const {
  ALERT_THRESHOLD,
  ALERT_SEVERITY_MULTIPLIER,
  VELOCITY_WINDOW,
  VELOCITY_THRESHOLD,
  VELOCITY_SEVERITY_WEIGHT,
  VOLUME_ANOMALY_STDDEV,
  VOLUME_SEVERITY_WEIGHT,
  HISTORY_LOOKBACK,
} = require('../_lib/config');

// ── Helpers ─────────────────────────────────────────────

/**
 * Fetch the last N snapshots per team from odds_history.
 * Returns { "Brazil": [{ odds, volume, recorded_at }, ...], ... }
 */
async function fetchRecentSnapshots(teamNames, limit) {
  // Fetch last `limit` rows per team, ordered newest first
  const { data, error } = await supabase
    .from('odds_history')
    .select('team, odds, volume, recorded_at')
    .in('team', teamNames)
    .order('recorded_at', { ascending: false })
    .limit(limit * teamNames.length);

  if (error) {
    console.error('fetchRecentSnapshots error:', error.message);
    return {};
  }

  // Group by team, keep at most `limit` per team
  const grouped = {};
  for (const row of data) {
    if (!grouped[row.team]) grouped[row.team] = [];
    if (grouped[row.team].length < limit) {
      grouped[row.team].push(row);
    }
  }
  return grouped;
}

/**
 * Save the current odds snapshot to odds_history.
 */
async function saveSnapshot(teams) {
  const rows = teams.map((t) => ({
    team: t.team,
    flag: t.flag,
    odds: t.odds,
    volume: t.volume || 0,
    source: 'polymarket',
  }));
  const { error } = await supabase.from('odds_history').insert(rows);
  if (error) console.error('saveSnapshot error:', error.message);
}

/**
 * Save detected alerts to the alerts table.
 */
async function saveAlerts(alerts, userId) {
  const rows = alerts.map((a) => ({
    user_id: userId || null,
    team: a.team,
    flag: a.flag,
    previous_odds: a.previousOdds,
    current_odds: a.currentOdds,
    change: a.change,
    type: a.type,
    severity: a.severity,
    message: a.message,
    detail: a.detail,
    channels: a.channelsSent || [],
    sent: a.channelsSent && a.channelsSent.length > 0,
  }));
  const { error } = await supabase.from('alerts').insert(rows);
  if (error) console.error('saveAlerts error:', error.message);
}

// ── Detection Logic ─────────────────────────────────────

/**
 * Compute velocity: cumulative odds change over the last N snapshots.
 * snapshots are ordered newest-first, so index 0 is the most recent *previous* snapshot.
 * Returns { velocity, direction } where velocity is absolute cumulative change.
 */
function computeVelocity(currentOdds, snapshots, window) {
  // We need at least `window` previous snapshots
  const usable = snapshots.slice(0, window);
  if (usable.length < 2) return null;

  const oldest = parseFloat(usable[usable.length - 1].odds);
  const velocity = currentOdds - oldest;

  return {
    velocity: Math.round(velocity * 100) / 100,
    absVelocity: Math.round(Math.abs(velocity) * 100) / 100,
    direction: velocity > 0 ? 'up' : 'down',
    windowUsed: usable.length,
  };
}

/**
 * Detect volume anomaly: is the current volume unusually high compared
 * to the team's recent average?
 * Returns { isAnomaly, zScore } or null if not enough data.
 */
function detectVolumeAnomaly(currentVolume, snapshots, threshold) {
  const volumes = snapshots
    .map((s) => parseFloat(s.volume || 0))
    .filter((v) => v > 0);

  if (volumes.length < 3) return null;

  const mean = volumes.reduce((a, b) => a + b, 0) / volumes.length;
  const variance = volumes.reduce((a, v) => a + (v - mean) ** 2, 0) / volumes.length;
  const stddev = Math.sqrt(variance);

  if (stddev === 0) return { isAnomaly: false, zScore: 0 };

  const zScore = (currentVolume - mean) / stddev;
  return {
    isAnomaly: zScore >= threshold,
    zScore: Math.round(zScore * 100) / 100,
  };
}

/**
 * Compute severity from multiple signals (0-100 scale).
 */
function computeSeverity({ absChange, velocityInfo, volumeAnomaly }) {
  let severity = 0;

  // Base: single-interval change
  severity += Math.abs(absChange) * ALERT_SEVERITY_MULTIPLIER;

  // Velocity bonus: sustained movement adds extra severity
  if (velocityInfo && velocityInfo.absVelocity >= VELOCITY_THRESHOLD) {
    severity += velocityInfo.absVelocity * VELOCITY_SEVERITY_WEIGHT;
  }

  // Volume anomaly bonus
  if (volumeAnomaly && volumeAnomaly.isAnomaly) {
    severity += Math.min(volumeAnomaly.zScore, 5) * VOLUME_SEVERITY_WEIGHT;
  }

  return Math.min(100, Math.round(severity));
}

// ── Main Handler ────────────────────────────────────────

module.exports = async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const teams = await fetchWinnerOdds();
    console.log(`checkOdds: fetched ${teams.length} teams`);

    // Fetch recent history from Supabase (instead of in-memory)
    const teamNames = teams.map((t) => t.team);
    const history = await fetchRecentSnapshots(teamNames, HISTORY_LOOKBACK);

    const alerts = [];

    for (const team of teams) {
      const snapshots = history[team.team] || [];
      const prev = snapshots.length > 0 ? parseFloat(snapshots[0].odds) : null;

      if (prev == null) continue; // First time seeing this team, skip

      const change = Math.round((team.odds - prev) * 100) / 100;
      const absChange = Math.abs(change);

      // ── Signal 1: Large single-interval change ──
      const hasSurge = absChange >= ALERT_THRESHOLD;

      // ── Signal 2: Velocity (sustained movement) ──
      const velocityInfo = computeVelocity(team.odds, snapshots, VELOCITY_WINDOW);
      const hasVelocity = velocityInfo && velocityInfo.absVelocity >= VELOCITY_THRESHOLD;

      // ── Signal 3: Volume anomaly ──
      const volumeAnomaly = detectVolumeAnomaly(team.volume, snapshots, VOLUME_ANOMALY_STDDEV);
      const hasVolumeAnomaly = volumeAnomaly && volumeAnomaly.isAnomaly;

      // Trigger alert if any signal fires
      if (!hasSurge && !hasVelocity && !hasVolumeAnomaly) continue;

      const type = change > 0 ? 'hot' : change < 0 ? 'drop' : 'info';
      const severity = computeSeverity({ absChange, velocityInfo, volumeAnomaly });

      // Build descriptive message
      const reasons = [];
      if (hasSurge) reasons.push(`${change > 0 ? 'surged' : 'dropped'} ${absChange.toFixed(1)}%`);
      if (hasVelocity) reasons.push(`velocity ${velocityInfo.direction} ${velocityInfo.absVelocity.toFixed(1)}% over ${velocityInfo.windowUsed} snapshots`);
      if (hasVolumeAnomaly) reasons.push(`volume spike (z=${volumeAnomaly.zScore.toFixed(1)})`);

      const message = `${team.team} odds: ${reasons.join(', ')}`;
      const detail = `${prev.toFixed(1)}% -> ${team.odds.toFixed(1)}% | Vol: $${(team.volume / 1e6).toFixed(1)}M | Severity: ${severity}/100`;

      alerts.push({
        team: team.team,
        flag: team.flag,
        previousOdds: prev,
        currentOdds: team.odds,
        change,
        type,
        severity,
        message,
        detail,
        // Track which signals triggered
        signals: {
          surge: hasSurge,
          velocity: hasVelocity ? velocityInfo : false,
          volumeAnomaly: hasVolumeAnomaly ? volumeAnomaly : false,
        },
        channelsSent: [],
      });
    }

    // Save current snapshot to Supabase (for next run's comparison)
    await saveSnapshot(teams);

    // Send alerts via existing notification channels
    const demoUserId = process.env.DEMO_USER_ID;
    if (alerts.length > 0 && demoUserId) {
      console.log(`checkOdds: ${alerts.length} alerts triggered`);
      for (const alert of alerts) {
        try {
          await sendAlertEmail(demoUserId, alert);
          alert.channelsSent.push('gmail');
          console.log(`  Email sent: ${alert.team} (severity ${alert.severity})`);
        } catch (err) {
          console.error(`  Email failed for ${alert.team}:`, err.message);
        }
        try {
          await postSlackAlert(demoUserId, alert);
          alert.channelsSent.push('slack');
          console.log(`  Slack sent: ${alert.team}`);
        } catch (err) {
          console.error(`  Slack failed for ${alert.team}:`, err.message);
        }
      }
    }

    // Persist alerts to Supabase
    if (alerts.length > 0) {
      await saveAlerts(alerts, demoUserId || null);
    }

    // Log top 5 for monitoring
    teams.slice(0, 5).forEach((t) => {
      console.log(`  ${t.flag} ${t.team}: ${t.odds}%`);
    });

    res.json({
      success: true,
      teamsCount: teams.length,
      alertsTriggered: alerts.length,
      alerts: alerts.map((a) => ({
        team: `${a.flag} ${a.team}`,
        change: `${a.change > 0 ? '+' : ''}${a.change.toFixed(1)}%`,
        severity: a.severity,
        signals: Object.entries(a.signals)
          .filter(([, v]) => v)
          .map(([k]) => k),
      })),
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('checkOdds failed:', err);
    res.status(500).json({ error: 'checkOdds failed' });
  }
};

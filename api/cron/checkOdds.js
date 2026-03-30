const { fetchWinnerOdds } = require('../_lib/polymarket');
const { sendAlertEmail, postSlackAlert } = require('../_lib/notifications');
const { ALERT_THRESHOLD, ALERT_SEVERITY_MULTIPLIER } = require('../_lib/config');

// In-memory store for previous odds (resets on cold start, but that's OK)
let previousOdds = {};

module.exports = async function handler(req, res) {
  // Verify cron secret for security
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const teams = await fetchWinnerOdds();
    console.log(`checkOdds: fetched ${teams.length} teams`);

    const alerts = [];

    // Compare with previous odds to detect changes
    for (const team of teams) {
      const prev = previousOdds[team.team];
      if (prev != null) {
        const change = Math.round((team.odds - prev) * 100) / 100;
        if (Math.abs(change) >= ALERT_THRESHOLD) {
          const type = change > 0 ? 'hot' : 'drop';
          alerts.push({
            team: team.team,
            flag: team.flag,
            previousOdds: prev,
            currentOdds: team.odds,
            change,
            type,
            severity: Math.min(100, Math.round(Math.abs(change) * ALERT_SEVERITY_MULTIPLIER)),
            message: `${team.team} odds ${change > 0 ? 'surged' : 'dropped'} ${Math.abs(change).toFixed(1)}%`,
            detail: `${prev.toFixed(1)}% → ${team.odds.toFixed(1)}% | Vol: $${(team.volume / 1e6).toFixed(1)}M`,
          });
        }
      }
    }

    // Update previous odds
    teams.forEach((t) => { previousOdds[t.team] = t.odds; });

    // Send alerts if any (using a demo user ID from env)
    const demoUserId = process.env.DEMO_USER_ID;
    if (alerts.length > 0 && demoUserId) {
      console.log(`checkOdds: ${alerts.length} alerts triggered`);
      for (const alert of alerts) {
        try {
          await sendAlertEmail(demoUserId, alert);
          console.log(`  Email sent: ${alert.team} ${alert.change > 0 ? '+' : ''}${alert.change.toFixed(1)}%`);
        } catch (err) {
          console.error(`  Email failed for ${alert.team}:`, err.message);
        }
        try {
          await postSlackAlert(demoUserId, alert);
          console.log(`  Slack sent: ${alert.team}`);
        } catch (err) {
          console.error(`  Slack failed for ${alert.team}:`, err.message);
        }
      }
    }

    // Log top 5 for monitoring
    teams.slice(0, 5).forEach((t) => {
      console.log(`  ${t.flag} ${t.team}: ${t.odds}%`);
    });

    res.json({
      success: true,
      teamsCount: teams.length,
      alertsTriggered: alerts.length,
      alerts: alerts.map((a) => `${a.flag} ${a.team}: ${a.change > 0 ? '+' : ''}${a.change.toFixed(1)}%`),
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('checkOdds failed:', err);
    res.status(500).json({ error: 'checkOdds failed' });
  }
};

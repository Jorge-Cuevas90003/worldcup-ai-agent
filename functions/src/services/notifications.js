const axios = require('axios');
const tokenVault = require('./auth0');

async function sendAlertEmail(userId, alert) {
  const token = await tokenVault.getGoogleToken(userId);

  const changeColor = alert.change > 0 ? '#00e676' : '#ef4444';
  const changeSign = alert.change > 0 ? '+' : '';
  const arrow = alert.change > 0 ? '▲' : '▼';

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:520px;margin:0 auto;background:#0a0e18;color:#e0e0e0;border-radius:12px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#c9a94e,#a08535);padding:16px 24px;text-align:center;">
        <h2 style="margin:0;color:#0a0e18;font-size:18px;">⚽ WorldCup Agent Alert</h2>
      </div>
      <div style="padding:24px;">
        <div style="text-align:center;margin-bottom:16px;">
          <span style="font-size:48px;">${alert.flag}</span>
          <h3 style="margin:8px 0 4px;font-size:22px;color:#fff;">${alert.team}</h3>
        </div>
        <div style="text-align:center;margin:16px 0;">
          <span style="font-size:28px;font-weight:bold;color:${changeColor};">${arrow} ${changeSign}${alert.change.toFixed(1)}%</span>
        </div>
        <div style="background:#111827;border-radius:8px;padding:16px;margin:16px 0;">
          <p style="margin:4px 0;color:#9ca3af;">Previous: <strong style="color:#fff;">${alert.previousOdds.toFixed(1)}%</strong></p>
          <p style="margin:4px 0;color:#9ca3af;">Current: <strong style="color:#fff;">${alert.currentOdds.toFixed(1)}%</strong></p>
          <p style="margin:4px 0;color:#9ca3af;">Severity: <strong style="color:${changeColor};">${alert.severity}/100</strong></p>
        </div>
        <p style="color:#6b7280;font-size:13px;text-align:center;margin-top:20px;">
          Powered by WorldCup Agent × Polymarket × Auth0 Token Vault
        </p>
      </div>
    </div>
  `;

  const raw = [
    'Content-Type: text/html; charset="UTF-8"',
    'MIME-Version: 1.0',
    `Subject: ${alert.flag} ${alert.team} odds ${alert.change > 0 ? 'surged' : 'dropped'} ${changeSign}${alert.change.toFixed(1)}%`,
    '',
    html,
  ].join('\r\n');

  const encoded = Buffer.from(raw).toString('base64url');

  await axios.post(
    'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
    { raw: encoded },
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

async function createMatchEvent(userId, match) {
  const token = await tokenVault.getGoogleToken(userId);

  const event = {
    summary: `⚽ ${match.home} vs ${match.away} — WC 2026 ${match.group || ''}`.trim(),
    description: [
      `Venue: ${match.venue || 'TBD'}`,
      `${match.home} odds: ${match.homeOdds || '—'}%`,
      `${match.away} odds: ${match.awayOdds || '—'}%`,
      `Draw: ${match.drawOdds || '—'}%`,
    ].join('\n'),
    start: { dateTime: match.startTime, timeZone: 'UTC' },
    end: { dateTime: match.endTime || match.startTime, timeZone: 'UTC' },
    colorId: '10',
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 60 },
        { method: 'popup', minutes: 15 },
      ],
    },
  };

  await axios.post(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    event,
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

async function postSlackAlert(userId, alert, channel) {
  const token = await tokenVault.getSlackToken(userId);

  const color = alert.change > 0 ? '#00e676' : '#ef4444';
  const sign = alert.change > 0 ? '+' : '';

  await axios.post(
    'https://slack.com/api/chat.postMessage',
    {
      channel: channel || process.env.SLACK_DEFAULT_CHANNEL || '#worldcup',
      text: `${alert.flag} *${alert.team}* odds shifted ${sign}${alert.change.toFixed(1)}%`,
      attachments: [
        {
          color,
          text: `*${alert.previousOdds.toFixed(1)}%* → *${alert.currentOdds.toFixed(1)}%*\nSeverity: ${alert.severity}/100\n_${alert.detail}_`,
          footer: '⚽ WorldCup Agent · Polymarket × Auth0',
        },
      ],
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

module.exports = { sendAlertEmail, createMatchEvent, postSlackAlert };

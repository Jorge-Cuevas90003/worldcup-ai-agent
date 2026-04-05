const tokenVault = require('./_lib/auth0');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { service } = req.body;
    const userId = process.env.DEMO_USER_ID;

    if (!userId) {
      return res.status(400).json({ error: 'DEMO_USER_ID not configured in environment' });
    }

    if (service === 'gmail') {
      // Get token from Token Vault
      const token = await tokenVault.getGoogleToken(userId);
      if (!token) {
        return res.status(400).json({ error: 'No Gmail token found. Please connect Gmail first.' });
      }

      // Get user profile to find email
      const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const profile = await profileRes.json();
      const userEmail = profile.email;

      // Build email
      const subject = '⚽ WorldCup AI Agent - Test Alert';
      const body = 'This is a test alert from WorldCup AI Agent.\n\nYour Gmail connection via Auth0 Token Vault is working correctly!\n\n🏆 Spain: 15.8%\n🇫🇷 France: 13.6%\n🏴 England: 11.4%\n\nYou will receive alerts when significant odds movements are detected.';

      const raw = btoa(
        `To: ${userEmail}\r\n` +
        `Subject: ${subject}\r\n` +
        `Content-Type: text/plain; charset=utf-8\r\n\r\n` +
        body
      ).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

      const sendRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ raw }),
      });

      if (!sendRes.ok) {
        const err = await sendRes.text();
        console.error('Gmail send error:', err);
        return res.status(500).json({ error: 'Failed to send email', details: err });
      }

      return res.json({ success: true, service: 'gmail', message: `Test email sent to ${userEmail}` });

    } else if (service === 'calendar') {
      const token = await tokenVault.getGoogleToken(userId);
      if (!token) {
        return res.status(400).json({ error: 'No Calendar token found. Please connect Calendar first.' });
      }

      // Create a test calendar event
      const now = new Date();
      const start = new Date(now.getTime() + 24 * 60 * 60 * 1000); // tomorrow
      const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // 2 hours later

      const event = {
        summary: '⚽ World Cup 2026 - Agent Alert Test',
        description: 'This is a test event created by WorldCup AI Agent via Auth0 Token Vault.\n\nYour Calendar connection is working correctly!',
        start: { dateTime: start.toISOString(), timeZone: 'UTC' },
        end: { dateTime: end.toISOString(), timeZone: 'UTC' },
      };

      const calRes = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });

      if (!calRes.ok) {
        const err = await calRes.text();
        console.error('Calendar error:', err);
        return res.status(500).json({ error: 'Failed to create event', details: err });
      }

      const created = await calRes.json();
      return res.json({ success: true, service: 'calendar', message: `Event created: ${created.htmlLink}` });

    } else if (service === 'slack') {
      const token = await tokenVault.getSlackToken(userId);
      if (!token) {
        return res.status(400).json({ error: 'No Slack token found. Please connect Slack first.' });
      }

      const slackRes = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel: '#general',
          text: '⚽ *WorldCup AI Agent - Test Alert*\n\nYour Slack connection via Auth0 Token Vault is working!\n\n🏆 Current favorites:\n• 🇪🇸 Spain: 15.8%\n• 🇫🇷 France: 13.6%\n• 🏴󠁧󠁢󠁥󠁮󠁧󠁿 England: 11.4%',
        }),
      });

      if (!slackRes.ok) {
        const err = await slackRes.text();
        return res.status(500).json({ error: 'Failed to send Slack message', details: err });
      }

      return res.json({ success: true, service: 'slack', message: 'Test message sent to #general' });

    } else {
      return res.status(400).json({ error: `Unknown service: ${service}` });
    }
  } catch (err) {
    console.error('testAlert error:', err);
    res.status(500).json({ error: 'Test failed', details: err.message });
  }
};

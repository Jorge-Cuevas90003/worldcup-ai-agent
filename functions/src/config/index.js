module.exports = {
  POLYMARKET_BASE: 'https://gamma-api.polymarket.com',
  POLYMARKET_WINNER_SLUG: '2026-fifa-world-cup-winner',

  ALERT_THRESHOLD: 1.0,       // minimum % change to trigger alert
  ALERT_SEVERITY_MULTIPLIER: 20, // severity = |change| * multiplier (capped at 100)

  COLLECTIONS: {
    ODDS: 'odds',
    ODDS_HISTORY: 'odds_history',
    ALERTS: 'alerts',
    USERS: 'users',
    MATCHES: 'matches',
  },

  TEAM_FLAGS: {
    'Spain': '🇪🇸',
    'England': '🇬🇧',
    'France': '🇫🇷',
    'Argentina': '🇦🇷',
    'Brazil': '🇧🇷',
    'Germany': '🇩🇪',
    'Portugal': '🇵🇹',
    'Netherlands': '🇳🇱',
    'Belgium': '🇧🇪',
    'Mexico': '🇲🇽',
    'Italy': '🇮🇹',
    'USA': '🇺🇸',
    'Uruguay': '🇺🇾',
    'Colombia': '🇨🇴',
    'Croatia': '🇭🇷',
    'Japan': '🇯🇵',
    'South Korea': '🇰🇷',
    'Morocco': '🇲🇦',
    'Senegal': '🇸🇳',
    'Denmark': '🇩🇰',
  },

  AUTH0: {
    DOMAIN: process.env.AUTH0_DOMAIN,
    CLIENT_ID: process.env.AUTH0_CLIENT_ID,
    CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET,
    AUDIENCE: process.env.AUTH0_AUDIENCE || `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
  },

  CONNECTIONS_MAP: {
    gmail: 'google-oauth2',
    calendar: 'google-oauth2',
    slack: 'slack',
  },

  GOOGLE_SCOPES: 'openid profile email https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/calendar.events',
  SLACK_SCOPES: 'chat:write channels:read',
};

module.exports = {
  POLYMARKET_BASE: 'https://gamma-api.polymarket.com',
  POLYMARKET_WINNER_SLUG: '2026-fifa-world-cup-winner',

  ALERT_THRESHOLD: 1.0,
  ALERT_SEVERITY_MULTIPLIER: 20,

  TEAM_FLAGS: {
    'Spain': '🇪🇸', 'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'France': '🇫🇷', 'Argentina': '🇦🇷',
    'Brazil': '🇧🇷', 'Germany': '🇩🇪', 'Portugal': '🇵🇹', 'Netherlands': '🇳🇱',
    'Belgium': '🇧🇪', 'Mexico': '🇲🇽', 'Italy': '🇮🇹', 'USA': '🇺🇸',
    'Uruguay': '🇺🇾', 'Colombia': '🇨🇴', 'Croatia': '🇭🇷', 'Japan': '🇯🇵',
    'South Korea': '🇰🇷', 'Morocco': '🇲🇦', 'Senegal': '🇸🇳', 'Denmark': '🇩🇰',
    'Switzerland': '🇨🇭', 'Serbia': '🇷🇸', 'Poland': '🇵🇱', 'Canada': '🇨🇦',
    'Ecuador': '🇪🇨', 'Saudi Arabia': '🇸🇦', 'Australia': '🇦🇺',
    'United States': '🇺🇸', 'Korea Republic': '🇰🇷', 'New Zealand': '🇳🇿',
    'Costa Rica': '🇨🇷', 'Cameroon': '🇨🇲', 'Ghana': '🇬🇭', 'Nigeria': '🇳🇬',
    'Tunisia': '🇹🇳', 'Iran': '🇮🇷', 'Qatar': '🇶🇦', 'Wales': '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
    'Paraguay': '🇵🇾', 'Peru': '🇵🇪', 'Chile': '🇨🇱', 'Turkey': '🇹🇷',
    'Austria': '🇦🇹', 'Czech Republic': '🇨🇿', 'Sweden': '🇸🇪', 'Norway': '🇳🇴',
    'Scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'Hungary': '🇭🇺', 'Ukraine': '🇺🇦', 'Egypt': '🇪🇬',
    'Algeria': '🇩🇿', 'Honduras': '🇭🇳', 'Jamaica': '🇯🇲', 'Panama': '🇵🇦',
    'Bolivia': '🇧🇴', 'Venezuela': '🇻🇪', 'China': '🇨🇳', 'India': '🇮🇳',
    'Albania': '🇦🇱', 'Republic of Ireland': '🇮🇪', 'Ireland': '🇮🇪',
    'Slovenia': '🇸🇮', 'Slovakia': '🇸🇰', 'Romania': '🇷🇴', 'Greece': '🇬🇷',
    'Iceland': '🇮🇸', 'Finland': '🇫🇮', 'Bosnia and Herzegovina': '🇧🇦',
    'North Macedonia': '🇲🇰', 'Montenegro': '🇲🇪', 'Georgia': '🇬🇪',
    'Ivory Coast': '🇨🇮', "Cote d'Ivoire": '🇨🇮', 'DR Congo': '🇨🇩',
    'South Africa': '🇿🇦', 'Mali': '🇲🇱', 'Burkina Faso': '🇧🇫',
    'Congo': '🇨🇬', 'Zambia': '🇿🇲', 'Tanzania': '🇹🇿', 'Kenya': '🇰🇪',
    'Bahrain': '🇧🇭', 'Iraq': '🇮🇶', 'Uzbekistan': '🇺🇿', 'Palestine': '🇵🇸',
    'Jordan': '🇯🇴', 'Oman': '🇴🇲', 'Kuwait': '🇰🇼', 'UAE': '🇦🇪',
    'United Arab Emirates': '🇦🇪', 'Indonesia': '🇮🇩', 'Thailand': '🇹🇭',
    'Vietnam': '🇻🇳', 'Philippines': '🇵🇭', 'Trinidad and Tobago': '🇹🇹',
    'El Salvador': '🇸🇻', 'Guatemala': '🇬🇹', 'Cuba': '🇨🇺', 'Haiti': '🇭🇹',
    'Curacao': '🇨🇼', 'Dominican Republic': '🇩🇴',
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
    slack: 'slack-oauth-2',
  },

  GOOGLE_SCOPES: 'openid profile email https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/calendar.events',
  SLACK_SCOPES: 'chat:write channels:read',
};

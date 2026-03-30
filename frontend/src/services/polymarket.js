// In dev, use Vite proxy. In production, use Vercel API route as proxy.
const isDev = import.meta.env.DEV;

function gammaUrl(path) {
  if (isDev) return `/polymarket-api/${path}`;
  return `/api/proxy?path=${encodeURIComponent(path)}`;
}

const WC_EVENT_SLUG = '2026-fifa-world-cup-winner-595';

const TEAM_FLAGS = {
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
};

// Fetch real World Cup winner odds via the known event slug
export async function fetchLiveOdds() {
  try {
    const res = await fetch(`${gammaUrl(`events/slug/${WC_EVENT_SLUG}`)}`);
    if (!res.ok) throw new Error(`API ${res.status}`);
    const event = await res.json();
    const markets = event.markets || [];

    const teams = markets
      .map((m) => {
        const team = m.groupItemTitle || parseTeamName(m.question || '');
        const prices = JSON.parse(m.outcomePrices || '["0","0"]');
        const odds = parseFloat(prices[0]) * 100;
        return {
          id: m.id,
          team,
          flag: TEAM_FLAGS[team] || '🏳️',
          odds: Math.round(odds * 100) / 100,
          volume: parseFloat(m.volume || 0),
          liquidity: parseFloat(m.liquidity || 0),
          slug: m.slug || '',
          change: 0,
          volumeNum: parseFloat(m.volume || 0),
        };
      })
      .filter((t) => t.odds >= 0.5 && !t.team.startsWith('Team'))
      .sort((a, b) => b.odds - a.odds);

    if (teams.length > 0) {
      return { teams, source: 'polymarket-live', timestamp: Date.now() };
    }
  } catch (err) {
    console.warn('Polymarket event fetch failed:', err.message);
  }

  return null;
}

function parseTeamName(question) {
  const match = question.match(/^Will (.+?) win/i);
  return match ? match[1].trim() : question;
}

// Fetch all WC-related events
export async function fetchWorldCupEvents() {
  try {
    const res = await fetch(`${gammaUrl(`events/slug/${WC_EVENT_SLUG}`)}`);
    if (!res.ok) throw new Error(`API ${res.status}`);
    const data = await res.json();
    return data.markets || [];
  } catch {
    return [];
  }
}

// Calculate momentum score (0-100) based on volume relative to odds
export function calculateMomentum(team, allTeams) {
  const maxVolume = Math.max(...allTeams.map((t) => t.volumeNum || 0));
  if (maxVolume === 0) return 50;

  const volumeRatio = (team.volumeNum || 0) / maxVolume;
  const oddsWeight = Math.min(team.odds / 20, 1);
  const changeBoost = Math.abs(team.change || 0) * 10;

  return Math.min(100, Math.round((volumeRatio * 40 + oddsWeight * 30 + changeBoost * 30)));
}

const { POLYMARKET_BASE, TEAM_FLAGS } = require('./config');

const WC_EVENT_SLUG = '2026-fifa-world-cup-winner-595';

function parseTeamName(question) {
  const match = question.match(/^Will (.+?) win/i);
  return match ? match[1] : question;
}

async function fetchWinnerOdds() {
  const res = await fetch(`${POLYMARKET_BASE}/events/slug/${WC_EVENT_SLUG}`);
  const data = await res.json();
  const markets = data.markets || [];

  return markets
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
      };
    })
    .filter((t) => t.odds >= 0.5)
    .sort((a, b) => b.odds - a.odds);
}

async function fetchWorldCupMarkets() {
  const res = await fetch(`${POLYMARKET_BASE}/events?tag=fifa-world-cup&closed=false`);
  const data = await res.json();
  return Array.isArray(data) ? data : [data];
}

module.exports = { fetchWinnerOdds, fetchWorldCupMarkets };

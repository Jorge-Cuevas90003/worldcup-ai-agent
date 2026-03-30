const axios = require('axios');
const { POLYMARKET_BASE, POLYMARKET_WINNER_SLUG, TEAM_FLAGS } = require('../config');

function parseTeamName(question) {
  // "Will Spain win the 2026 FIFA World Cup?" → "Spain"
  const match = question.match(/^Will (.+?) win/i);
  return match ? match[1] : question;
}

async function fetchWinnerOdds() {
  const { data } = await axios.get(`${POLYMARKET_BASE}/markets`, {
    params: { slug: POLYMARKET_WINNER_SLUG, closed: false },
  });

  const markets = Array.isArray(data) ? data : [data];
  return markets
    .map((m) => {
      const team = parseTeamName(m.question || '');
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
    .filter((t) => t.odds > 0)
    .sort((a, b) => b.odds - a.odds);
}

async function fetchWorldCupMarkets() {
  const { data } = await axios.get(`${POLYMARKET_BASE}/events`, {
    params: { tag: 'fifa-world-cup', closed: false },
  });
  return Array.isArray(data) ? data : [data];
}

async function fetchPriceHistory(marketId) {
  try {
    const { data } = await axios.get(`${POLYMARKET_BASE}/markets/${marketId}/prices`);
    return data;
  } catch {
    return [];
  }
}

module.exports = { fetchWinnerOdds, fetchWorldCupMarkets, fetchPriceHistory };

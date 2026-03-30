// ── Advanced Analytics Engine ──
// Calculates velocity, correlation, volatility, and sentiment from odds snapshots

/**
 * Odds Velocity — Rate of change per hour
 * Positive = rising fast, Negative = falling fast, 0 = stable
 */
export function calculateVelocity(history) {
  if (!history || history.length < 2) return 0;
  const sorted = [...history].sort((a, b) => new Date(a.recorded_at) - new Date(b.recorded_at));
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const timeDiffHours = (new Date(last.recorded_at) - new Date(first.recorded_at)) / 3600000;
  if (timeDiffHours < 0.01) return 0;
  const oddsDiff = last.odds - first.odds;
  return Math.round((oddsDiff / timeDiffHours) * 100) / 100;
}

/**
 * Volatility Index — Standard deviation of odds changes (0-100 scale)
 * Higher = more unstable = more opportunity
 */
export function calculateVolatility(history) {
  if (!history || history.length < 3) return 0;
  const sorted = [...history].sort((a, b) => new Date(a.recorded_at) - new Date(b.recorded_at));
  const changes = [];
  for (let i = 1; i < sorted.length; i++) {
    changes.push(sorted[i].odds - sorted[i - 1].odds);
  }
  const mean = changes.reduce((s, c) => s + c, 0) / changes.length;
  const variance = changes.reduce((s, c) => s + Math.pow(c - mean, 2), 0) / changes.length;
  const stdDev = Math.sqrt(variance);
  // Normalize to 0-100 scale (typical stdDev for odds is 0-0.5)
  return Math.min(100, Math.round(stdDev * 200));
}

/**
 * Correlation between two teams — Pearson correlation coefficient
 * +1 = move together, -1 = inverse (when A rises, B falls), 0 = no relation
 */
export function calculateCorrelation(historyA, historyB) {
  if (!historyA || !historyB || historyA.length < 3 || historyB.length < 3) return 0;

  // Align by timestamp (find matching pairs)
  const mapB = {};
  historyB.forEach((h) => {
    const key = new Date(h.recorded_at).toISOString().slice(0, 16); // minute precision
    mapB[key] = h.odds;
  });

  const pairs = [];
  historyA.forEach((h) => {
    const key = new Date(h.recorded_at).toISOString().slice(0, 16);
    if (mapB[key] != null) {
      pairs.push({ a: h.odds, b: mapB[key] });
    }
  });

  if (pairs.length < 3) return 0;

  const n = pairs.length;
  const sumA = pairs.reduce((s, p) => s + p.a, 0);
  const sumB = pairs.reduce((s, p) => s + p.b, 0);
  const sumAB = pairs.reduce((s, p) => s + p.a * p.b, 0);
  const sumA2 = pairs.reduce((s, p) => s + p.a * p.a, 0);
  const sumB2 = pairs.reduce((s, p) => s + p.b * p.b, 0);

  const num = n * sumAB - sumA * sumB;
  const den = Math.sqrt((n * sumA2 - sumA * sumA) * (n * sumB2 - sumB * sumB));
  if (den === 0) return 0;

  return Math.round((num / den) * 100) / 100;
}

/**
 * Market Sentiment — Aggregate bullish/bearish score (-100 to +100)
 * Combines: direction of change + volume weight + velocity
 * Positive = market is bullish on this team, Negative = bearish
 */
export function calculateSentiment(team, velocity, volatility) {
  const change = team.change || 0;
  const volumeWeight = Math.min(1, (team.volumeNum || 0) / 50000000); // normalize to $50M max

  // Direction component (-50 to +50)
  const directionScore = Math.max(-50, Math.min(50, change * 30));

  // Velocity component (-30 to +30)
  const velocityScore = Math.max(-30, Math.min(30, velocity * 15));

  // Volume conviction component (0 to 20) — high volume = more conviction
  const volumeScore = volumeWeight * 20 * (change >= 0 ? 1 : -1);

  return Math.round(directionScore + velocityScore + volumeScore);
}

/**
 * Sentiment label from score
 */
export function sentimentLabel(score) {
  if (score >= 40) return { label: 'STRONG BUY', color: '#00e676' };
  if (score >= 15) return { label: 'BULLISH', color: '#4ade80' };
  if (score >= 5) return { label: 'SLIGHT BULL', color: '#86efac' };
  if (score > -5) return { label: 'NEUTRAL', color: '#94a3b8' };
  if (score > -15) return { label: 'SLIGHT BEAR', color: '#fca5a5' };
  if (score > -40) return { label: 'BEARISH', color: '#f87171' };
  return { label: 'STRONG SELL', color: '#ef4444' };
}

/**
 * Build full analytics for a team
 */
export function buildTeamAnalytics(team, history) {
  const velocity = calculateVelocity(history);
  const volatility = calculateVolatility(history);
  const sentiment = calculateSentiment(team, velocity, volatility);
  const sentimentInfo = sentimentLabel(sentiment);

  return {
    velocity,
    velocityLabel: velocity > 0 ? `+${velocity}/hr` : `${velocity}/hr`,
    volatility,
    volatilityLabel: volatility > 50 ? 'HIGH' : volatility > 20 ? 'MED' : 'LOW',
    sentiment,
    sentimentLabel: sentimentInfo.label,
    sentimentColor: sentimentInfo.color,
  };
}

/**
 * Build correlation matrix for top N teams
 */
export function buildCorrelationMatrix(teamsHistory) {
  const teams = Object.keys(teamsHistory);
  const matrix = {};

  for (const a of teams) {
    matrix[a] = {};
    for (const b of teams) {
      if (a === b) {
        matrix[a][b] = 1;
      } else {
        matrix[a][b] = calculateCorrelation(teamsHistory[a], teamsHistory[b]);
      }
    }
  }

  return matrix;
}

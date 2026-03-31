// ── Advanced Analytics Engine v2 ──
// Sophisticated market analytics for World Cup odds: velocity, volatility,
// correlation, ELO ratings, smart money detection, edge calculation,
// trend strength, market efficiency, and composite sentiment.

// ── Historical World Cup Win Rates (approximate, based on tournament history) ──
const HISTORICAL_WC_WIN_RATES = {
  brazil: 0.227,       // 5 wins / 22 tournaments
  germany: 0.182,      // 4 wins / 22
  italy: 0.182,        // 4 wins / 22
  argentina: 0.136,    // 3 wins / 22
  france: 0.091,       // 2 wins / 22
  uruguay: 0.091,      // 2 wins / 22
  england: 0.045,      // 1 win / 22
  spain: 0.045,        // 1 win / 22
  netherlands: 0.0,    // 0 wins (3 finals)
  portugal: 0.0,       // 0 wins
};

// ── Helpers ──

function safeSorted(history) {
  if (!history || history.length === 0) return [];
  return [...history].sort((a, b) => new Date(a.recorded_at) - new Date(b.recorded_at));
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

// ────────────────────────────────────────────────────────────────────────────
// 1. VELOCITY — Weighted Moving Average
// ────────────────────────────────────────────────────────────────────────────

/**
 * Calculates odds velocity using a linearly-weighted moving average.
 * Recent data points receive higher weight so the velocity reflects
 * the *current* momentum rather than the average over the full window.
 *
 * Weight for point i (0-indexed, chronological) = (i + 1).
 * The returned value is the weighted average of per-interval changes,
 * expressed as change-per-hour.
 *
 * @param {Array<{odds: number, recorded_at: string}>} history
 * @returns {number} Weighted velocity (change per hour). Positive = rising.
 */
export function calculateVelocity(history) {
  const sorted = safeSorted(history);
  if (sorted.length < 2) return 0;

  let weightedSum = 0;
  let weightTotal = 0;

  for (let i = 1; i < sorted.length; i++) {
    const dt = (new Date(sorted[i].recorded_at) - new Date(sorted[i - 1].recorded_at)) / 3600000;
    if (dt < 0.001) continue; // skip duplicate timestamps
    const changePerHour = (sorted[i].odds - sorted[i - 1].odds) / dt;
    const weight = i; // linear weight: later intervals weigh more
    weightedSum += changePerHour * weight;
    weightTotal += weight;
  }

  if (weightTotal === 0) return 0;
  return Math.round((weightedSum / weightTotal) * 100) / 100;
}

// ────────────────────────────────────────────────────────────────────────────
// 2. VOLATILITY — Standard deviation of log-returns (0-100 scale)
// ────────────────────────────────────────────────────────────────────────────

/**
 * Volatility Index — Measures the standard deviation of period-over-period
 * percentage changes (log-returns style). Normalised to a 0-100 scale.
 * Higher = more unstable = more trading opportunity.
 *
 * @param {Array<{odds: number, recorded_at: string}>} history
 * @returns {number} Volatility score 0-100.
 */
export function calculateVolatility(history) {
  const sorted = safeSorted(history);
  if (sorted.length < 3) return 0;

  const changes = [];
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i - 1].odds > 0) {
      changes.push((sorted[i].odds - sorted[i - 1].odds) / sorted[i - 1].odds);
    }
  }
  if (changes.length === 0) return 0;

  const mean = changes.reduce((s, c) => s + c, 0) / changes.length;
  const variance = changes.reduce((s, c) => s + Math.pow(c - mean, 2), 0) / changes.length;
  const stdDev = Math.sqrt(variance);

  // Normalize: typical percentage stdDev for odds is 0-0.05 (5%)
  return Math.min(100, Math.round(stdDev * 2000));
}

// ────────────────────────────────────────────────────────────────────────────
// 3. CORRELATION — Pearson correlation coefficient
// ────────────────────────────────────────────────────────────────────────────

/**
 * Pearson correlation coefficient between two teams' odds histories.
 * Histories are aligned by timestamp at minute precision.
 *
 * +1 = move together, -1 = inverse, 0 = no linear relationship.
 *
 * @param {Array<{odds: number, recorded_at: string}>} historyA
 * @param {Array<{odds: number, recorded_at: string}>} historyB
 * @returns {number} Correlation coefficient rounded to 2 decimals.
 */
export function calculateCorrelation(historyA, historyB) {
  if (!historyA || !historyB || historyA.length < 3 || historyB.length < 3) return 0;

  const mapB = {};
  historyB.forEach((h) => {
    const key = new Date(h.recorded_at).toISOString().slice(0, 16);
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

// ────────────────────────────────────────────────────────────────────────────
// 4. ELO-STYLE POWER RATING
// ────────────────────────────────────────────────────────────────────────────

/**
 * Computes an ELO-inspired power rating (0-100) for a team based on:
 *   - Base rating derived from current odds (odds * 10, so 15% → 150)
 *   - Momentum bonus/penalty from velocity
 *   - Volume conviction: higher volume relative to the average across all
 *     teams yields a bonus
 *
 * @param {{odds: number, volumeNum: number}} team  Current snapshot of the team.
 * @param {Array<{odds: number, volumeNum: number}>} allTeams  All teams for relative comparison.
 * @returns {number} Power rating 0-100.
 */
export function calculateEloRating(team, allTeams) {
  if (!team) return 50;

  const odds = team.odds || 0;
  const volume = team.volumeNum || 0;

  // Base rating: odds percentage * 10 (capped contribution at 60 pts)
  const baseRating = clamp(odds * 10, 0, 60);

  // Momentum from velocity (if available on team object, else 0)
  const velocity = team._velocity || 0;
  const momentumBonus = clamp(velocity * 5, -15, 15);

  // Volume conviction relative to peers
  let volumeBonus = 0;
  if (allTeams && allTeams.length > 0) {
    const avgVolume = allTeams.reduce((s, t) => s + (t.volumeNum || 0), 0) / allTeams.length;
    if (avgVolume > 0) {
      const relativeVolume = volume / avgVolume;
      volumeBonus = clamp((relativeVolume - 1) * 10, -10, 25);
    }
  }

  const raw = baseRating + momentumBonus + volumeBonus;
  return Math.round(clamp(raw, 0, 100));
}

// ────────────────────────────────────────────────────────────────────────────
// 5. SMART MONEY DETECTOR
// ────────────────────────────────────────────────────────────────────────────

/**
 * Detects whether "smart money" or "retail money" is likely driving a move.
 *
 * Logic:
 *   - High volume + small price change → institutional accumulation ("SMART MONEY IN")
 *   - High volume + big price drop     → distribution ("DISTRIBUTION")
 *   - Low volume + big price change    → retail panic / FOMO ("RETAIL FOMO")
 *   - Low volume + small price change  → quiet period ("QUIET")
 *   - Medium conditions                → accumulation phase ("ACCUMULATION")
 *
 * Thresholds are relative to the team's own history so the signal adapts.
 *
 * @param {{odds: number, change: number, volumeNum: number}} team
 * @param {Array<{odds: number, recorded_at: string}>} history
 * @returns {{signal: string, confidence: number}} signal label and 0-100 confidence.
 */
export function detectSmartMoney(team, history) {
  const DEFAULT = { signal: 'QUIET', confidence: 0 };
  if (!team) return DEFAULT;

  const sorted = safeSorted(history);
  const change = Math.abs(team.change || 0);
  const volume = team.volumeNum || 0;

  // Compute average absolute change from history to set dynamic thresholds
  let avgChange = 0.5; // fallback
  if (sorted.length >= 2) {
    let totalChange = 0;
    for (let i = 1; i < sorted.length; i++) {
      totalChange += Math.abs(sorted[i].odds - sorted[i - 1].odds);
    }
    avgChange = totalChange / (sorted.length - 1) || 0.5;
  }

  const bigMove = change > avgChange * 1.5;
  const smallMove = change <= avgChange * 0.5;
  const highVolume = volume > 20_000_000; // $20M+
  const lowVolume = volume < 5_000_000;   // <$5M

  if (highVolume && smallMove) {
    return { signal: 'SMART MONEY IN', confidence: clamp(Math.round((volume / 50_000_000) * 100), 40, 95) };
  }
  if (highVolume && bigMove && (team.change || 0) < 0) {
    return { signal: 'DISTRIBUTION', confidence: clamp(Math.round(change / avgChange * 30), 30, 90) };
  }
  if (lowVolume && bigMove) {
    return { signal: 'RETAIL FOMO', confidence: clamp(Math.round(change / avgChange * 25), 20, 80) };
  }
  if (!lowVolume && !highVolume && !smallMove) {
    return { signal: 'ACCUMULATION', confidence: 40 };
  }
  return DEFAULT;
}

// ────────────────────────────────────────────────────────────────────────────
// 6. IMPLIED PROBABILITY EDGE
// ────────────────────────────────────────────────────────────────────────────

/**
 * Compares a team's current Polymarket implied probability against its
 * historical World Cup win rate. A positive edge means the market is
 * pricing the team higher than history suggests (OVERVALUED from a
 * pure-historical standpoint), and negative means UNDERVALUED.
 *
 * @param {{name: string, odds: number}} team
 * @returns {{edge: number, label: string, historicalRate: number|null}}
 *   edge is in percentage points (e.g., 5.75 means 5.75% overvalued).
 */
export function calculateEdge(team) {
  const DEFAULT = { edge: 0, label: 'NO DATA', historicalRate: null };
  if (!team) return DEFAULT;

  const teamName = (team.team || team.name || '');
  if (!teamName) return DEFAULT;

  const key = teamName.toLowerCase().trim();
  const historicalRate = HISTORICAL_WC_WIN_RATES[key];

  if (historicalRate == null) return DEFAULT;

  const impliedProb = (team.odds || 0) / 100; // odds are stored as percentages
  const edgeRaw = (impliedProb - historicalRate) * 100; // back to percentage points
  const edge = Math.round(edgeRaw * 100) / 100;

  let label;
  if (Math.abs(edge) < 1) {
    label = 'FAIR VALUE';
  } else if (edge > 0) {
    label = `OVERVALUED by ${Math.abs(edge).toFixed(1)}%`;
  } else {
    label = `UNDERVALUED by ${Math.abs(edge).toFixed(1)}%`;
  }

  return { edge, label, historicalRate: Math.round(historicalRate * 10000) / 100 };
}

// ────────────────────────────────────────────────────────────────────────────
// 7. TREND STRENGTH (ADX-inspired)
// ────────────────────────────────────────────────────────────────────────────

/**
 * Measures how strong a trend is, not its direction — inspired by the
 * Average Directional Index (ADX) from technical analysis.
 *
 * Approach:
 *   1. Compute directional moves (+DM / -DM) for each interval.
 *   2. Smooth with an exponential moving average.
 *   3. Derive a directional index (DI+ − DI−) and its absolute strength.
 *   4. Normalise to 0-100 where 0 = no trend (choppy) and 100 = very strong trend.
 *
 * @param {Array<{odds: number, recorded_at: string}>} history
 * @returns {number} Trend strength score 0-100.
 */
export function calculateTrendStrength(history) {
  const sorted = safeSorted(history);
  if (sorted.length < 4) return 0;

  const moves = [];
  for (let i = 1; i < sorted.length; i++) {
    moves.push(sorted[i].odds - sorted[i - 1].odds);
  }

  // Separate positive and negative directional moves
  const posMoves = moves.map((m) => (m > 0 ? m : 0));
  const negMoves = moves.map((m) => (m < 0 ? -m : 0));

  // Exponential smoothing factor
  const alpha = 2 / (moves.length + 1);

  function ema(values) {
    let result = values[0];
    for (let i = 1; i < values.length; i++) {
      result = alpha * values[i] + (1 - alpha) * result;
    }
    return result;
  }

  const smoothPos = ema(posMoves);
  const smoothNeg = ema(negMoves);
  const totalSmooth = smoothPos + smoothNeg;

  if (totalSmooth === 0) return 0;

  // Directional index: how one-sided is the movement?
  const dx = Math.abs(smoothPos - smoothNeg) / totalSmooth;

  // Also factor in consistency: what fraction of moves are in the dominant direction?
  const dominant = smoothPos > smoothNeg ? posMoves : negMoves;
  const consistency = dominant.filter((m) => m > 0).length / moves.length;

  // Combine DX and consistency
  const raw = (dx * 0.6 + consistency * 0.4) * 100;
  return Math.round(clamp(raw, 0, 100));
}

// ────────────────────────────────────────────────────────────────────────────
// 8. MARKET EFFICIENCY SCORE
// ────────────────────────────────────────────────────────────────────────────

/**
 * Estimates how efficiently the market is pricing this team's odds.
 *
 * An efficient market shows smooth, small adjustments.  An inefficient
 * market shows long flat periods followed by sudden jumps (indicating
 * delayed reaction to information — i.e., trading opportunity).
 *
 * Metric: ratio of max single-interval move to the average move.
 * High ratio → inefficient (jumpy). Low ratio → efficient (smooth).
 *
 * @param {Array<{odds: number, recorded_at: string}>} history
 * @returns {{score: number, label: string}}
 *   score 0-100 where 0 = very efficient, 100 = very inefficient.
 */
export function calculateMarketEfficiency(history) {
  const sorted = safeSorted(history);
  if (sorted.length < 4) return { score: 0, label: 'INSUFFICIENT DATA' };

  const absMoves = [];
  for (let i = 1; i < sorted.length; i++) {
    absMoves.push(Math.abs(sorted[i].odds - sorted[i - 1].odds));
  }

  const avgMove = absMoves.reduce((s, m) => s + m, 0) / absMoves.length;
  const maxMove = Math.max(...absMoves);

  if (avgMove === 0) return { score: 0, label: 'FLAT' };

  // Ratio of max move to average move — higher = more inefficient
  const ratio = maxMove / avgMove;

  // Also penalise long "flat then spike" patterns: count consecutive flat intervals
  let maxFlat = 0;
  let currentFlat = 0;
  const flatThreshold = avgMove * 0.3;
  for (const m of absMoves) {
    if (m < flatThreshold) {
      currentFlat++;
      maxFlat = Math.max(maxFlat, currentFlat);
    } else {
      currentFlat = 0;
    }
  }
  const flatPenalty = clamp((maxFlat / absMoves.length) * 50, 0, 30);

  // Normalise ratio to 0-70 range (typical ratio is 1-10)
  const ratioScore = clamp((ratio - 1) * 8, 0, 70);

  const score = Math.round(clamp(ratioScore + flatPenalty, 0, 100));

  let label;
  if (score >= 60) label = 'INEFFICIENT — opportunity';
  else if (score >= 35) label = 'MODERATE';
  else label = 'EFFICIENT — hard to profit';

  return { score, label };
}

// ────────────────────────────────────────────────────────────────────────────
// 9. COMPOSITE SENTIMENT (enhanced)
// ────────────────────────────────────────────────────────────────────────────

/**
 * Enhanced market sentiment that combines multiple signals into one score.
 *
 * Components (weights):
 *   - Direction of recent change          30%
 *   - Velocity (weighted)                 25%
 *   - Volume anomaly vs $50M benchmark    15%
 *   - Trend strength                      15%
 *   - Smart money signal bonus            15%
 *
 * Result: -100 (extreme bearish) to +100 (extreme bullish).
 *
 * @param {{change: number, volumeNum: number}} team
 * @param {number} velocity   From calculateVelocity()
 * @param {number} volatility From calculateVolatility()
 * @param {number} [trendStrength]  From calculateTrendStrength() (optional)
 * @param {{signal: string, confidence: number}} [smartMoney] From detectSmartMoney() (optional)
 * @returns {number} Sentiment score -100 to +100.
 */
export function calculateSentiment(team, velocity, volatility, trendStrength, smartMoney) {
  if (!team) return 0;

  const change = team.change || 0;
  const volumeNum = team.volumeNum || 0;
  const volumeWeight = Math.min(1, volumeNum / 50_000_000);

  // Direction component (-30 to +30)
  const directionScore = clamp(change * 30, -30, 30);

  // Velocity component (-25 to +25)
  const velocityScore = clamp(velocity * 12, -25, 25);

  // Volume conviction component (-15 to +15)
  const volumeScore = volumeWeight * 15 * (change >= 0 ? 1 : -1);

  // Trend strength component (0 to +15): strong trend amplifies direction
  const ts = trendStrength || 0;
  const trendScore = (ts / 100) * 15 * (change >= 0 ? 1 : -1);

  // Smart money bonus (-15 to +15)
  let smartMoneyScore = 0;
  if (smartMoney) {
    const conf = (smartMoney.confidence || 0) / 100;
    if (smartMoney.signal === 'SMART MONEY IN') smartMoneyScore = conf * 15;
    else if (smartMoney.signal === 'DISTRIBUTION') smartMoneyScore = -conf * 15;
    else if (smartMoney.signal === 'RETAIL FOMO') smartMoneyScore = conf * 8 * (change >= 0 ? 1 : -1);
    else if (smartMoney.signal === 'ACCUMULATION') smartMoneyScore = conf * 5;
  }

  const raw = directionScore + velocityScore + volumeScore + trendScore + smartMoneyScore;
  return Math.round(clamp(raw, -100, 100));
}

// ────────────────────────────────────────────────────────────────────────────
// 10. SENTIMENT LABEL
// ────────────────────────────────────────────────────────────────────────────

/**
 * Maps a numeric sentiment score to a human-readable label and colour.
 *
 * @param {number} score  Sentiment score from calculateSentiment().
 * @returns {{label: string, color: string}}
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

// ────────────────────────────────────────────────────────────────────────────
// 11. BUILD TEAM ANALYTICS (enhanced)
// ────────────────────────────────────────────────────────────────────────────

/**
 * Builds a full analytics snapshot for a single team, including all new
 * metrics. This is the main entry point for the UI.
 *
 * @param {{name: string, odds: number, change: number, volumeNum: number}} team
 * @param {Array<{odds: number, recorded_at: string}>} history
 * @param {Array<{odds: number, volumeNum: number}>} [allTeams] Optional, for ELO.
 * @returns {object} Complete analytics bundle.
 */
export function buildTeamAnalytics(team, history, allTeams) {
  const velocity = calculateVelocity(history);
  const volatility = calculateVolatility(history);
  const trendStrength = calculateTrendStrength(history);
  const smartMoney = detectSmartMoney(team, history);
  const sentiment = calculateSentiment(team, velocity, volatility, trendStrength, smartMoney);
  const sentimentInfo = sentimentLabel(sentiment);
  const edge = calculateEdge(team);
  const marketEfficiency = calculateMarketEfficiency(history);

  // Attach velocity to team for ELO calculation
  const teamWithVelocity = { ...team, _velocity: velocity };
  const eloRating = calculateEloRating(teamWithVelocity, allTeams || []);

  return {
    // Original metrics (preserved)
    velocity,
    velocityLabel: velocity > 0 ? `+${velocity}/hr` : `${velocity}/hr`,
    volatility,
    volatilityLabel: volatility > 50 ? 'HIGH' : volatility > 20 ? 'MED' : 'LOW',
    sentiment,
    sentimentLabel: sentimentInfo.label,
    sentimentColor: sentimentInfo.color,

    // New metrics
    eloRating,
    eloLabel: eloRating >= 70 ? 'ELITE' : eloRating >= 50 ? 'CONTENDER' : eloRating >= 30 ? 'DARK HORSE' : 'LONG SHOT',
    smartMoney: smartMoney.signal,
    smartMoneyConfidence: smartMoney.confidence,
    trendStrength,
    trendLabel: trendStrength >= 60 ? 'STRONG' : trendStrength >= 30 ? 'MODERATE' : 'WEAK',
    edge: edge.edge,
    edgeLabel: edge.label,
    historicalWinRate: edge.historicalRate,
    marketEfficiency: marketEfficiency.score,
    marketEfficiencyLabel: marketEfficiency.label,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// 12. CORRELATION MATRIX
// ────────────────────────────────────────────────────────────────────────────

/**
 * Builds a Pearson correlation matrix for all teams in the provided map.
 *
 * @param {Object<string, Array<{odds: number, recorded_at: string}>>} teamsHistory
 * @returns {Object<string, Object<string, number>>} Matrix[teamA][teamB] = correlation.
 */
export function buildCorrelationMatrix(teamsHistory) {
  if (!teamsHistory) return {};
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

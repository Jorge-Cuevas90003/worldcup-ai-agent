import { Info } from 'lucide-react';

const TIPS = {
  'dashboard-hero': 'ODDS = The probability that a team wins, calculated from real money bets on Polymarket. Higher % = more likely to win.',
  'dashboard-countdown': 'COUNTDOWN = Days until the World Cup 2026 starts on June 11 in USA, Mexico, and Canada.',
  'dashboard-stats': 'STAT CARDS = Quick summary: who\'s the favorite, market momentum, total trading volume, and data source.',
  'market-intelligence': 'MARKET INTELLIGENCE = Advanced metrics for each team: ELO rating (power score), sentiment (market mood), and edge (overvalued/undervalued vs historical data).',
  'odds-trend': 'ODDS TREND = How odds changed over time. Rising line = team getting more popular. Multiple lines help spot correlations.',
  'portfolio-sim': 'PORTFOLIO SIMULATOR = Calculate potential profit. If you bet $100 on a team with 10% odds and they win, you get $1,000 (10x return).',
  'alerts': 'ALERTS = Notifications when odds change significantly. A \'surge\' means odds went up (bullish). A \'drop\' means odds went down (bearish).',
  'matches': 'MATCH ODDS = Probability of each outcome in a specific game. Home%, Draw%, Away% always add up to ~100%.',
  'vault': 'TOKEN VAULT = Auth0 securely stores your Gmail/Slack login tokens. The app NEVER sees your password \u2014 it only gets permission to send alerts.',
  'permissions': 'PERMISSIONS = Exactly what the agent can do with your accounts. We follow \'Principle of Least Privilege\' \u2014 only the minimum access needed.',
  'security-log': 'SECURITY LOG = Audit trail showing every token operation. Proves that all authentication goes through Auth0, not our servers.',
  'watchlist': 'WATCHLIST = Your favorite teams. Star a team to track it at the top of your dashboard.',
  'ticker': 'TICKER = Scrolling bar showing all teams and their current odds, like a stock market ticker.',
  'sentiment': 'SENTIMENT = Market mood indicator. BULLISH = traders think team will do better. BEARISH = traders think team will do worse. Based on volume, velocity, and trend.',
  'elo': 'ELO RATING = Power ranking (0-100) combining odds, momentum, and trading volume. Higher = stronger position.',
  'edge': 'EDGE = Compares current Polymarket odds vs historical World Cup win rates. OVERVALUED = market thinks they\'re better than history suggests. UNDERVALUED = potential bargain.',
  'velocity': 'VELOCITY = Speed of odds change per hour. Fast rising = hot team. Fast falling = losing confidence.',
  'volatility': 'VOLATILITY = How much odds fluctuate. High volatility = risky but potentially profitable. Low = stable.',
};

export default function LearnOverlay({ section, theme }) {
  const tip = TIPS[section];
  if (!tip) return null;

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 6,
      padding: '6px 10px',
      margin: '6px 0',
      background: theme.primaryBg,
      border: `1px solid ${theme.accent}33`,
      borderRadius: (theme.borderRadius || 8) * 0.5,
      animation: 'fadeIn 0.35s cubic-bezier(.4,0,.2,1) both',
      maxWidth: '100%',
    }}>
      <Info size={12} color={theme.primary} style={{ flexShrink: 0, marginTop: 1 }} />
      <div style={{
        fontSize: 10,
        fontFamily: theme.fontData,
        color: theme.primary,
        lineHeight: 1.45,
      }}>
        <span style={{ fontWeight: 700, marginRight: 4 }}>LEARN:</span>
        {tip}
      </div>
    </div>
  );
}

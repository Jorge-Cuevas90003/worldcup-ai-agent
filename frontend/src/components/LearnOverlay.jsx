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
  'elo': 'ELO RATING = Power ranking (0-100) inspired by chess ELO system. Combines current odds (how likely to win), momentum (speed of change), and volume conviction (how much money is behind it). Higher = stronger market position.',
  'edge': 'EDGE = The difference between what Polymarket traders think vs what history says. Example: Spain has 15.8% on Polymarket but only won 1 of 22 World Cups (4.5%). This means the market thinks Spain is 11.3% OVERVALUED compared to history. Smart traders look for UNDERVALUED teams.',
  'velocity': 'VELOCITY = Speed of odds change per hour. Fast rising = hot team. Fast falling = losing confidence.',
  'volatility': 'VOLATILITY = How much odds fluctuate. High volatility = risky but potentially profitable. Low = stable.',
  'smart-money': 'SMART MONEY = When large institutional traders are buying, they do it slowly to avoid moving the price. Signs: high volume but small price change = big players accumulating. Low volume + big price jump = retail panic/FOMO.',
  'volatility-detail': 'VOLATILITY = How wildly a team\'s odds swing. Measured like stock market volatility (standard deviation of returns). High volatility teams are riskier but offer bigger profit potential. Low volatility = stable but boring.',
  'trend-strength': 'TREND STRENGTH = Inspired by ADX (Average Directional Index) from stock trading. Measures if a trend is REAL or just noise. Score 0-100. Above 50 = strong, sustained trend worth following. Below 20 = no clear direction.',
  'market-efficiency': 'MARKET EFFICIENCY = How quickly odds react to new information. Inefficient markets have sudden jumps after periods of calm \u2014 these are opportunities. Efficient markets move smoothly \u2014 harder to profit from.',
  'polymarket': 'POLYMARKET = A prediction market where you buy shares in outcomes. If you buy \'Spain wins\' at $0.158 and they win, you get $1.00 (6.3x return). Prices reflect crowd wisdom \u2014 thousands of traders betting real money.',
  'token-lifecycle': 'TOKEN LIFECYCLE = The journey of your OAuth token: 1) You authorize access 2) Auth0 receives the token 3) Token Vault stores it encrypted 4) When it expires, Auth0 auto-refreshes it 5) Our agent uses the fresh token to call Gmail/Slack API. You never have to re-login.',
  'probability-bar': 'PROBABILITY BAR = In match cards, the colored bar shows each outcome\'s probability. Green = home team %, gray = draw %, red = away team %. The wider the segment, the more likely that outcome. All segments add up to ~100%.',
  'severity': 'SEVERITY SCORE = How significant an odds change is, from 0-100. Calculated as |change| * 20. A 1% shift = SEV 20 (minor). A 5% shift = SEV 100 (massive, rare event). Higher severity = more attention needed.',
  'countdown-detail': 'COUNTDOWN = The 2026 FIFA World Cup will be held across USA, Mexico, and Canada from June 11 to July 19, 2026. It\'s the first World Cup with 48 teams (up from 32). This countdown shows the exact time until the opening match.',
  'watchlist-detail': 'WATCHLIST = Star your favorite teams to pin them at the top of your dashboard. Useful for tracking specific teams without scrolling through 23+ entries. Your watchlist is saved to the cloud (Supabase) so it persists across sessions.',
  'portfolio-detail': 'PORTFOLIO SIMULATOR = A risk-free way to test betting strategies. Enter a dollar amount, pick a team, and see the potential return. The math: Payout = Bet / (Odds/100). So $100 on a team with 10% odds = $1,000 payout if they win. The lower the odds, the higher the potential return \u2014 but the less likely to win.',
  'theme-detail': 'THEMES = Each of our 11 themes isn\'t just a color swap \u2014 they have different typography (serif, sans-serif, monospace), different card styles (glass, flat, neumorphic, outline), different animations (fade, slide, scale), and different border treatments (solid, dashed, double). Try \'Classic Press\' for a newspaper feel or \'Neon Cyber\' for cyberpunk.',
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
      borderLeft: `3px solid ${theme.accent}`,
      borderRadius: (theme.borderRadius || 8) * 0.5,
      animation: 'fadeIn 0.35s cubic-bezier(.4,0,.2,1) both',
      maxWidth: '100%',
    }}>
      <Info size={12} color={theme.accent} style={{ flexShrink: 0, marginTop: 1 }} />
      <div style={{
        fontSize: 11,
        fontFamily: theme.fontData,
        color: theme.primary,
        lineHeight: 1.45,
      }}>
        <span style={{ fontWeight: 700, marginRight: 4, color: theme.accent }}>LEARN:</span>
        {tip}
      </div>
    </div>
  );
}

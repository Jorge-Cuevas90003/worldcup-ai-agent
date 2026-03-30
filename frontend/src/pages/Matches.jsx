import { CalendarDays } from 'lucide-react';
import MatchCard from '../components/MatchCard';

const demoMatches = [
  { id: '1', home: 'Mexico', away: 'Poland', homeFlag: '🇲🇽', awayFlag: '🇵🇱', homeOdds: 42, awayOdds: 28, drawOdds: 30, group: 'Group G', venue: 'Estadio Azteca, Mexico City', synced: true },
  { id: '2', home: 'Spain', away: 'Netherlands', homeFlag: '🇪🇸', awayFlag: '🇳🇱', homeOdds: 48, awayOdds: 25, drawOdds: 27, group: 'Group A', venue: 'MetLife Stadium, New Jersey', synced: false },
  { id: '3', home: 'Argentina', away: 'France', homeFlag: '🇦🇷', awayFlag: '🇫🇷', homeOdds: 38, awayOdds: 35, drawOdds: 27, group: 'Group B', venue: 'AT&T Stadium, Dallas', synced: true },
  { id: '4', home: 'Brazil', away: 'Germany', homeFlag: '🇧🇷', awayFlag: '🇩🇪', homeOdds: 40, awayOdds: 30, drawOdds: 30, group: 'Group C', venue: 'SoFi Stadium, Los Angeles', synced: false },
  { id: '5', home: 'England', away: 'Portugal', homeFlag: '🇬🇧', awayFlag: '🇵🇹', homeOdds: 45, awayOdds: 27, drawOdds: 28, group: 'Group D', venue: 'Hard Rock Stadium, Miami', synced: true },
  { id: '6', home: 'Belgium', away: 'Morocco', homeFlag: '🇧🇪', awayFlag: '🇲🇦', homeOdds: 44, awayOdds: 24, drawOdds: 32, group: 'Group E', venue: 'BMO Stadium, Toronto', synced: false },
];

export default function Matches({ isPro, theme, bp }) {
  const isMobile = ['xxs', 'xs', 'sm'].includes(bp);

  return (
    <div style={{ padding: isMobile ? '16px 14px' : '24px', maxWidth: isPro ? 900 : 640, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 11,
          background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentAlt})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 4px 16px ${theme.primaryGlow}`,
        }}>
          <CalendarDays size={18} color="#fff" />
        </div>
        <div>
          <h2 style={{
            fontSize: isPro ? 15 : 20, fontWeight: isPro ? 600 : 800, color: theme.text, margin: 0,
            fontFamily: theme.fontHeading,
            textTransform: isPro ? 'uppercase' : 'none',
            letterSpacing: isPro ? '0.12em' : 0,
          }}>
            {isPro ? 'MATCH CENTER' : 'Upcoming Games'}
          </h2>
          <div style={{ fontSize: 11, color: theme.textDim, fontFamily: theme.fontData }}>
            {demoMatches.length} matches scheduled
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: isPro && !isMobile ? '1fr 1fr' : '1fr',
        gap: isPro ? 10 : 12,
      }}>
        {demoMatches.map((m, i) => (
          <MatchCard key={m.id} match={m} isPro={isPro} theme={theme} index={i} />
        ))}
      </div>
    </div>
  );
}

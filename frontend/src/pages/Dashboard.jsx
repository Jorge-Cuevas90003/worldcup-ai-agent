import { useState, useEffect, useCallback } from 'react';
import { Trophy, BarChart3, Users, Activity, TrendingUp, Sparkles, Zap, PieChart as PieIcon } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePie, Pie, Cell, BarChart, Bar } from 'recharts';
import StatCard from '../components/StatCard';
import TeamRow from '../components/TeamRow';
import WatchlistPanel from '../components/WatchlistPanel';
import { SkeletonCard, SkeletonRow } from '../components/Skeleton';
import { cardBox, headingStyle, dataFont, animEntry } from '../utils/styles';
import AnimatedNumber from '../components/AnimatedNumber';
import FlagIcon from '../components/FlagIcon';
import LearnOverlay from '../components/LearnOverlay';
import AIInsights from '../components/AIInsights';
import { buildTeamAnalytics, sentimentLabel, calculateEloRating, detectSmartMoney, calculateEdge } from '../services/analytics';
import { getOddsHistory, getWatchlist, addToWatchlist, removeFromWatchlist } from '../services/supabase';

const HARDCODED_USER_ID = '00000000-0000-0000-0000-000000000000';

const demoHistory = [
  { date: 'Oct', Spain: 14.2, England: 11.5, France: 10.0, Argentina: 9.8, Brazil: 9.0 },
  { date: 'Nov', Spain: 14.5, England: 12.0, France: 10.2, Argentina: 10.0, Brazil: 9.2 },
  { date: 'Dec', Spain: 14.8, England: 12.3, France: 10.5, Argentina: 10.1, Brazil: 9.3 },
  { date: 'Jan', Spain: 15.0, England: 12.5, France: 10.6, Argentina: 10.0, Brazil: 9.4 },
  { date: 'Feb', Spain: 15.1, England: 12.7, France: 10.6, Argentina: 10.1, Brazil: 9.3 },
  { date: 'Mar', Spain: 15.3, England: 12.8, France: 10.7, Argentina: 10.1, Brazil: 9.4 },
];

// Fetch real odds history from Supabase for the trend chart
function useOddsHistory() {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchHistory() {
      try {
        const teams = ['Spain', 'England', 'France'];
        const results = await Promise.all(
          teams.map((t) => getOddsHistory(t, 180))
        );

        // Check if any query errored or returned no data
        if (results.some((r) => r.error)) return;

        const allRows = {};
        teams.forEach((team, idx) => {
          const rows = results[idx].data || [];
          for (const row of rows) {
            const day = new Date(row.recorded_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            });
            if (!allRows[day]) allRows[day] = { _ts: new Date(row.recorded_at).getTime() };
            // Last snapshot per day wins (rows are ordered ascending)
            allRows[day][team] = row.odds;
          }
        });

        const sorted = Object.entries(allRows)
          .sort((a, b) => a[1]._ts - b[1]._ts)
          .map(([date, vals]) => {
            const { _ts, ...rest } = vals;
            return { date, ...rest };
          });

        // Need at least 3 distinct days to be useful
        if (!cancelled && sorted.length >= 3) {
          setChartData(sorted);
        }
      } catch {
        // silently fall back to demoHistory
      }
    }

    fetchHistory();
    return () => { cancelled = true; };
  }, []);

  return chartData;
}

// World Cup 2026 kickoff
const WC_START = new Date('2026-06-11T00:00:00Z').getTime();

function CountdownBlock({ theme, isMobile }) {
  const [diff, setDiff] = useState(WC_START - Date.now());
  useEffect(() => {
    const id = setInterval(() => setDiff(WC_START - Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (diff <= 0) return null;
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  const unit = (val, label) => (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        fontSize: isMobile ? 28 : 36, fontWeight: 800,
        fontFamily: theme.fontHeading, lineHeight: 1,
        color: theme.accent,
      }}>
        {String(val).padStart(2, '0')}
      </div>
      <div style={{
        fontSize: 9, color: theme.textMuted, ...headingStyle(theme), marginTop: 2,
      }}>
        {label}
      </div>
    </div>
  );

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: isMobile ? 16 : 24,
    }}>
      {unit(d, 'days')}{unit(h, 'hours')}{unit(m, 'mins')}{unit(s, 'secs')}
    </div>
  );
}

// Portfolio Simulator
function PortfolioSimulator({ teams, theme, isMobile }) {
  const [bet, setBet] = useState(100);
  const [selected, setSelected] = useState(0);

  const team = teams[selected];
  if (!team) return null;

  const impliedOdds = team.odds / 100;
  const payout = impliedOdds > 0 ? (bet / impliedOdds) : 0;
  const profit = payout - bet;

  return (
    <div style={cardBox(theme)}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${theme.green}, ${theme.accent})` }} />
      <h3 style={{
        fontSize: 10, color: theme.textMuted, ...headingStyle(theme),
        margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <PieIcon size={12} color={theme.green} /> Portfolio Simulator
      </h3>

      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 100 }}>
          <label style={{ fontSize: 9, color: theme.textMuted, ...dataFont(theme), display: 'block', marginBottom: 4 }}>
            BET AMOUNT ($)
          </label>
          <input
            type="number" value={bet}
            onChange={(e) => setBet(Math.max(0, Number(e.target.value)))}
            style={{
              width: '100%', padding: '8px 12px', borderRadius: theme.borderRadius,
              background: theme.card2, border: `1px solid ${theme.border}`,
              color: theme.text, fontSize: 16, fontWeight: 700,
              ...dataFont(theme), outline: 'none',
            }}
          />
        </div>
        <div style={{ flex: 1, minWidth: 100 }}>
          <label style={{ fontSize: 9, color: theme.textMuted, ...dataFont(theme), display: 'block', marginBottom: 4 }}>
            TEAM
          </label>
          <select
            value={selected}
            onChange={(e) => setSelected(Number(e.target.value))}
            style={{
              width: '100%', padding: '8px 12px', borderRadius: theme.borderRadius,
              background: theme.card2, border: `1px solid ${theme.border}`,
              color: theme.text, fontSize: 13, fontWeight: 600,
              fontFamily: theme.fontHeading, textTransform: theme.textTransform,
              cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none',
            }}
          >
            {teams.map((t, i) => (
              <option key={t.team} value={i}>{t.team} ({t.odds}%)</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8,
        padding: '14px', borderRadius: theme.borderRadius, background: theme.card2,
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 9, color: theme.textMuted, ...dataFont(theme), marginBottom: 4 }}>ODDS</div>
          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: theme.fontHeading, color: theme.primary }}>
            {team.odds?.toFixed(1)}%
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 9, color: theme.textMuted, ...dataFont(theme), marginBottom: 4 }}>PAYOUT</div>
          <div style={{
            fontSize: 18, fontWeight: 700, fontFamily: theme.fontHeading,
            color: theme.accent,
          }}>
            ${payout.toFixed(0)}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 9, color: theme.textMuted, ...dataFont(theme), marginBottom: 4 }}>PROFIT</div>
          <div style={{
            fontSize: 18, fontWeight: 700, fontFamily: theme.fontHeading,
            color: theme.green,
          }}>
            +${profit.toFixed(0)}
          </div>
        </div>
      </div>
      <div style={{
        fontSize: 10, color: theme.textMuted, textAlign: 'center', marginTop: 8,
        ...dataFont(theme),
      }}>
        If {team.team} wins, ${bet} becomes ${payout.toFixed(2)} ({(payout / bet).toFixed(1)}x return)
      </div>
    </div>
  );
}

export default function Dashboard({ isPro, theme, bp, teams: propTeams, dataSource, lastUpdate, learning }) {
  const teams = propTeams || [];
  const isMobile = ['xxs', 'xs', 'sm'].includes(bp);
  const realHistory = useOddsHistory();

  // ── Watchlist ──
  const [watchedTeamNames, setWatchedTeamNames] = useState([]);

  useEffect(() => {
    let cancelled = false;
    async function loadWatchlist() {
      try {
        const { data } = await getWatchlist(HARDCODED_USER_ID);
        if (!cancelled && data) {
          setWatchedTeamNames(data.map((r) => r.team));
        }
      } catch { /* ignore */ }
    }
    loadWatchlist();
    return () => { cancelled = true; };
  }, []);

  async function handleToggleWatch(teamName) {
    const isCurrentlyWatched = watchedTeamNames.includes(teamName);
    if (isCurrentlyWatched) {
      setWatchedTeamNames((prev) => prev.filter((n) => n !== teamName));
      await removeFromWatchlist(HARDCODED_USER_ID, teamName);
    } else {
      setWatchedTeamNames((prev) => [...prev, teamName]);
      await addToWatchlist(HARDCODED_USER_ID, teamName);
    }
  }

  // ── Team histories for Market Intelligence analytics ──
  const [teamHistories, setTeamHistories] = useState({});

  useEffect(() => {
    if (teams.length === 0) return;
    const fetchHistories = async () => {
      const histories = {};
      for (const t of teams.slice(0, 8)) {
        try {
          const { data } = await getOddsHistory(t.team, 7);
          if (data && data.length > 0) histories[t.team] = data;
        } catch { /* ignore */ }
      }
      setTeamHistories(histories);
    };
    fetchHistories();
  }, [teams.length]); // only refetch when team count changes

  const watchedTeams = teams.filter((t) => watchedTeamNames.includes(t.team));
  const oddsHistory = realHistory || demoHistory;
  const isXXS = bp === 'xxs';
  const isLoading = dataSource === 'loading';
  const totalVolume = teams.reduce((s, t) => s + (t.volume || 0), 0);
  const topTeam = teams[0];

  // Loading state
  if (isLoading) {
    return (
      <div style={{ padding: isMobile ? '16px 14px' : '28px 24px', maxWidth: isPro ? 1200 : 640, margin: '0 auto' }}>
        {isPro && (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} theme={theme} />)}
          </div>
        )}
        {!isPro && <SkeletonCard theme={theme} />}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
          {[...Array(5)].map((_, i) => <SkeletonRow key={i} theme={theme} />)}
        </div>
      </div>
    );
  }

  if (!isPro) {
    // ── LITE MODE ──
    return (
      <div style={{ padding: isMobile ? '16px 14px' : '28px 24px', maxWidth: 640, margin: '0 auto' }}>
        {/* Hero */}
        <div style={{
          ...cardBox(theme, isMobile ? '24px 20px' : '32px'),
          borderRadius: theme.borderRadius + 8,
          textAlign: 'center',
          marginBottom: 16, animation: animEntry(theme, 0),
        }}>
          <div style={{
            position: 'absolute', top: '-30%', left: '50%', transform: 'translateX(-50%)',
            width: '80%', height: '80%', borderRadius: '50%',
            background: theme.primaryGlow, filter: 'blur(60px)', pointerEvents: 'none',
          }} />
          <div style={{ position: 'relative' }}>
            {/* Countdown */}
            <div style={{ marginBottom: 16 }}>
              <div style={{
                fontSize: 10, color: theme.textMuted, ...headingStyle(theme), marginBottom: 8,
              }}>
                World Cup 2026 kicks off in
              </div>
              <CountdownBlock theme={theme} isMobile={isMobile} />
            </div>
            {learning && <LearnOverlay section="dashboard-countdown" theme={theme} />}

            <div style={{ width: '100%', height: 1, background: theme.border, margin: '16px 0' }} />

            {/* Featured team */}
            <FlagIcon team={topTeam?.team} size={isXXS ? 48 : 64} />
            <div style={{
              fontSize: isXXS ? 38 : 52, fontWeight: 800, lineHeight: 1,
              fontFamily: theme.fontHeading,
              color: theme.accent,
              margin: '6px 0 4px',
            }}>
              <AnimatedNumber value={topTeam?.odds || 0} style={{ color: theme.accent }} />%
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: theme.text, fontFamily: theme.fontBody }}>
              {topTeam?.team}
            </div>
            <div style={{
              fontSize: 11, color: theme.textDim, marginTop: 4, ...dataFont(theme),
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              {dataSource && dataSource !== 'fallback' && dataSource !== 'loading' ? (
                <><span style={{ width: 5, height: 5, borderRadius: '50%', background: theme.green, animation: 'pulse 2s infinite' }} /> Live from Polymarket</>
              ) : (
                'Current favorite to win World Cup 2026'
              )}
            </div>
          </div>
        </div>
        {learning && <LearnOverlay section="dashboard-hero" theme={theme} />}

        {/* Watchlist */}
        <WatchlistPanel
          watchedTeams={watchedTeams}
          onRemove={handleToggleWatch}
          theme={theme}
        />

        {/* Team list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {teams.slice(1).map((t, i) => (
            <div key={t.team} style={{ animation: animEntry(theme, i + 1) }}>
              <TeamRow team={t} rank={i + 2} isPro={false} theme={theme}
                isWatched={watchedTeamNames.includes(t.team)}
                onWatch={handleToggleWatch}
              />
            </div>
          ))}
        </div>

        {/* AI Insights */}
        <div style={{ marginTop: 16, animation: animEntry(theme, teams.length) }}>
          <AIInsights theme={theme} isMobile={isMobile} />
        </div>

        {/* Portfolio Simulator */}
        <div style={{ marginTop: 16, animation: animEntry(theme, teams.length + 1) }}>
          <PortfolioSimulator teams={teams} theme={theme} isMobile={isMobile} />
        </div>
        {learning && <LearnOverlay section="portfolio-sim" theme={theme} />}

        <div style={{
          textAlign: 'center', marginTop: 16, padding: '14px 20px', borderRadius: theme.borderRadius,
          cursor: 'pointer', background: `linear-gradient(135deg, ${theme.primaryBg}, ${theme.card2})`,
          border: `1px solid ${theme.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <Sparkles size={16} color={theme.primary} />
          <span style={{ fontSize: 13, color: theme.primary, fontWeight: 700, fontFamily: theme.fontBody }}>
            Switch to Pro for charts & deep analytics
          </span>
        </div>
      </div>
    );
  }

  // ── PRO MODE ──
  const pieData = teams.slice(0, 6).map((t) => ({ name: t.team, value: t.odds }));
  const pieColors = [theme.accent, theme.green, theme.blue, theme.red, theme.textDim, theme.accentAlt];
  const barData = teams.slice(0, 8).map((t) => ({ name: t.team.substring(0, 3).toUpperCase(), volume: (t.volume || 0) / 1e6 }));

  const gc = cardBox(theme);
  const sectionTitle = {
    fontSize: 10, color: theme.textMuted, ...headingStyle(theme), margin: '0 0 14px',
  };

  // Find highest momentum team
  const topMomentum = teams.reduce((best, t) => (t.momentum || 0) > (best.momentum || 0) ? t : best, teams[0] || {});

  return (
    <div style={{ padding: isMobile ? '12px' : '20px 24px' }}>
      {/* Watchlist */}
      <WatchlistPanel
        watchedTeams={watchedTeams}
        onRemove={handleToggleWatch}
        theme={theme}
      />

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
        <div style={{ animation: animEntry(theme, 0) }}><StatCard icon={Trophy} label="FAVORITE" value={`${topTeam?.odds?.toFixed(1)}%`} subtitle={topTeam?.team} theme={theme} /></div>
        <div style={{ animation: animEntry(theme, 1) }}><StatCard icon={Zap} label="MOMENTUM" value={`${topMomentum?.momentum || '—'}`} subtitle={`${topMomentum?.team} hottest`} theme={theme} accent={theme.green} /></div>
        <div style={{ animation: animEntry(theme, 2) }}><StatCard icon={BarChart3} label="VOLUME" value={`$${(totalVolume / 1e6).toFixed(0)}M`} subtitle={dataSource && dataSource !== 'fallback' ? 'Polymarket live' : 'Demo data'} theme={theme} /></div>
        <div style={{ animation: animEntry(theme, 3) }}><StatCard icon={Activity} label="SOURCE"
          value={dataSource && dataSource !== 'fallback' && dataSource !== 'loading' ? 'Live' : 'Demo'}
          subtitle={lastUpdate ? `Updated ${lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Polling 15s'}
          theme={theme} accent={theme.accentAlt} /></div>
      </div>
      {learning && <LearnOverlay section="dashboard-stats" theme={theme} />}

      {/* Market Intelligence Panel */}
      <div style={{ ...gc, marginBottom: 16, padding: '16px 18px' }}>
        <h3 style={sectionTitle}>Market Intelligence</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: 8,
        }}>
          {teams.slice(0, isMobile ? 4 : 8).map((t) => {
            const analytics = buildTeamAnalytics(t, teamHistories[t.team] || [], teams);
            const sInfo = sentimentLabel(analytics.sentiment);
            const edge = calculateEdge(t);
            const smartMoney = detectSmartMoney(t, []);
            const elo = calculateEloRating(t, teams);
            return (
              <div key={t.team} className="card-hover" style={{
                padding: '10px 12px', borderRadius: Math.min(theme.borderRadius, 10),
                background: theme.card2, border: `1px solid ${theme.border}`,
                transition: 'all 0.2s',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <FlagIcon team={t.team} size={16} />
                  <span style={{ fontSize: 11, fontWeight: 700, fontFamily: theme.fontHeading, color: theme.text }}>
                    {t.team.length > 8 ? t.team.substring(0, 7) + '.' : t.team}
                  </span>
                  <span style={{ marginLeft: 'auto', fontSize: 8, fontFamily: theme.fontData, color: theme.textMuted }}>
                    ELO {elo}
                  </span>
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, fontFamily: theme.fontHeading, color: theme.accent, lineHeight: 1 }}>
                  {t.odds?.toFixed(2)}%
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 4, flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: 8, fontWeight: 700, fontFamily: theme.fontData,
                    padding: '1px 4px', borderRadius: Math.min(theme.borderRadius, 4),
                    background: (t.change || 0) >= 0 ? theme.greenDim : theme.redDim,
                    color: (t.change || 0) >= 0 ? theme.green : theme.red,
                  }}>
                    {(t.change || 0) >= 0 ? '+' : ''}{(t.change || 0).toFixed(2)}%
                  </span>
                  <span style={{
                    fontSize: 7, fontWeight: 700, fontFamily: theme.fontData,
                    padding: '1px 4px', borderRadius: Math.min(theme.borderRadius, 4),
                    background: `${sInfo.color}20`, color: sInfo.color,
                  }}>
                    {sInfo.label}
                  </span>
                  {edge.label !== 'NO DATA' && (
                    <span style={{
                      fontSize: 7, fontWeight: 700, fontFamily: theme.fontData,
                      padding: '1px 4px', borderRadius: Math.min(theme.borderRadius, 4),
                      background: edge.label === 'UNDERVALUED' ? theme.greenDim : edge.label === 'OVERVALUED' ? theme.redDim : `${theme.textMuted}20`,
                      color: edge.label === 'UNDERVALUED' ? theme.green : edge.label === 'OVERVALUED' ? theme.red : theme.textMuted,
                    }}>
                      {edge.label} {edge.edge > 0 ? '+' : ''}{edge.edge.toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {learning && <LearnOverlay section="market-intelligence" theme={theme} />}
      {learning && <LearnOverlay section="elo" theme={theme} />}
      {learning && <LearnOverlay section="edge" theme={theme} />}

      {/* AI Insights */}
      <div style={{ marginBottom: 16 }}>
        <AIInsights theme={theme} isMobile={isMobile} />
      </div>

      {/* Bento grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr',
        gridTemplateRows: 'auto auto', gap: 12, marginBottom: 16,
      }}>
        <div style={{ ...gc, gridRow: isMobile ? 'auto' : '1 / 3' }}>
          <h3 style={sectionTitle}>6-Month Odds Trend</h3>
          <ResponsiveContainer width="100%" height={isMobile ? 200 : 280}>
            <AreaChart data={oddsHistory}>
              <defs>
                <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={theme.accent} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={theme.accent} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={theme.green} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={theme.green} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.chartGrid} />
              <XAxis dataKey="date" tick={{ fill: theme.chartText, fontSize: 10, fontFamily: theme.fontData }} axisLine={false} />
              <YAxis tick={{ fill: theme.chartText, fontSize: 10, fontFamily: theme.fontData }} axisLine={false} />
              <Tooltip contentStyle={{ background: theme.tooltipBg, border: `1px solid ${theme.tooltipBorder}`, borderRadius: theme.borderRadius, fontSize: 11, fontFamily: theme.fontData }} />
              <Area type="monotone" dataKey="Spain" stroke={theme.accent} fill="url(#gP)" strokeWidth={2} />
              <Area type="monotone" dataKey="England" stroke={theme.green} fill="url(#gG)" strokeWidth={2} />
              <Area type="monotone" dataKey="France" stroke={theme.accentAlt} fill="transparent" strokeWidth={1.5} strokeDasharray="5 3" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={gc}>
          <h3 style={sectionTitle}>Market Share</h3>
          <ResponsiveContainer width="100%" height={140}>
            <RePie>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={58} dataKey="value"
                label={({ name, value }) => `${name.substring(0, 3)} ${value}%`} labelLine={false}
                style={{ fontSize: 9, fontFamily: theme.fontData }}
              >
                {pieData.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}
              </Pie>
            </RePie>
          </ResponsiveContainer>
        </div>

        <div style={gc}>
          <h3 style={sectionTitle}>Volume ($M)</h3>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={barData}>
              <XAxis dataKey="name" tick={{ fill: theme.chartText, fontSize: 9, fontFamily: theme.fontData }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: theme.tooltipBg, border: `1px solid ${theme.tooltipBorder}`, borderRadius: theme.borderRadius, fontSize: 10 }} />
              <Bar dataKey="volume" radius={[Math.min(theme.borderRadius, 4), Math.min(theme.borderRadius, 4), 0, 0]}>
                {barData.map((_, i) => <Cell key={i} fill={i === 0 ? theme.accent : `${theme.accent}88`} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      {learning && <LearnOverlay section="odds-trend" theme={theme} />}

      {/* Portfolio simulator (Pro) */}
      <div style={{ marginBottom: 16 }}>
        <PortfolioSimulator teams={teams} theme={theme} isMobile={isMobile} />
      </div>
      {learning && <LearnOverlay section="portfolio-sim" theme={theme} />}
      {learning && <LearnOverlay section="portfolio-detail" theme={theme} />}

      {/* Full table */}
      <div style={{ ...gc, padding: 0, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${theme.border}` }}>
              {['#', 'TEAM', 'ODDS', '24H', 'VOLUME', '', ''].map((h) => (
                <th key={h} style={{
                  padding: '12px 14px', textAlign: 'left', fontSize: 9,
                  color: theme.textMuted, ...headingStyle(theme),
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {teams.map((t, i) => (
              <TeamRow key={t.team} team={t} rank={i + 1} isPro={true} theme={theme}
                isWatched={watchedTeamNames.includes(t.team)}
                onWatch={handleToggleWatch}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

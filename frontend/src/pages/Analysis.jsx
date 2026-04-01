import { useState, useEffect } from 'react';
import { BarChart3 } from 'lucide-react';
import { cardBox, headingStyle, dataFont } from '../utils/styles';
import LearnOverlay from '../components/LearnOverlay';
import { buildCorrelationMatrix } from '../services/analytics';
import { getOddsHistory } from '../services/supabase';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';

const teamStats = {
  Spain: { ATK: 92, DEF: 88, MID: 95, GK: 85, SET: 80, PHY: 82 },
  England: { ATK: 90, DEF: 82, MID: 88, GK: 87, SET: 78, PHY: 84 },
  France: { ATK: 93, DEF: 85, MID: 90, GK: 83, SET: 76, PHY: 88 },
  Argentina: { ATK: 91, DEF: 80, MID: 89, GK: 82, SET: 82, PHY: 79 },
  Brazil: { ATK: 94, DEF: 78, MID: 91, GK: 80, SET: 74, PHY: 86 },
  Germany: { ATK: 86, DEF: 90, MID: 87, GK: 90, SET: 84, PHY: 85 },
};

const h2hStats = [
  { stat: 'Goals/Game', home: 2.4, away: 2.1 },
  { stat: 'Possession', home: 58, away: 54 },
  { stat: 'xG', home: 2.1, away: 1.8 },
  { stat: 'Clean Sheets', home: 45, away: 38 },
  { stat: 'Win Rate', home: 72, away: 68 },
];

const trendData = [
  { month: 'Oct', Spain: 14.2, England: 11.5, France: 10.0, Argentina: 9.8, Brazil: 9.0, Germany: 7.5 },
  { month: 'Nov', Spain: 14.5, England: 12.0, France: 10.2, Argentina: 10.0, Brazil: 9.2, Germany: 7.4 },
  { month: 'Dec', Spain: 14.8, England: 12.3, France: 10.5, Argentina: 10.1, Brazil: 9.3, Germany: 7.3 },
  { month: 'Jan', Spain: 15.0, England: 12.5, France: 10.6, Argentina: 10.0, Brazil: 9.4, Germany: 7.2 },
  { month: 'Feb', Spain: 15.1, England: 12.7, France: 10.6, Argentina: 10.1, Brazil: 9.3, Germany: 7.2 },
  { month: 'Mar', Spain: 15.3, England: 12.8, France: 10.7, Argentina: 10.1, Brazil: 9.4, Germany: 7.2 },
];

const teamNames = Object.keys(teamStats);
const lineColors = ['#c9a94e', '#00e676', '#3b82f6', '#ef4444', '#22d3ee', '#a855f7'];

const CORR_TEAMS = ['Spain', 'England', 'France', 'Argentina', 'Brazil', 'Germany', 'Portugal', 'Netherlands'];

function getCorrelationColor(val) {
  if (val === 1) return 'rgba(100,100,120,0.25)';
  if (val >= 0.6) return 'rgba(0,230,118,0.55)';
  if (val >= 0.3) return 'rgba(0,230,118,0.3)';
  if (val >= 0.1) return 'rgba(0,230,118,0.15)';
  if (val > -0.1) return 'rgba(148,163,184,0.15)';
  if (val > -0.3) return 'rgba(239,68,68,0.15)';
  if (val > -0.6) return 'rgba(239,68,68,0.3)';
  return 'rgba(239,68,68,0.55)';
}

function getCorrelationTextColor(val) {
  if (val === 1) return '#94a3b8';
  if (val >= 0.3) return '#00e676';
  if (val > -0.3) return '#94a3b8';
  return '#ef4444';
}

export default function Analysis({ theme, bp, learning }) {
  const [teamA, setTeamA] = useState('Spain');
  const [teamB, setTeamB] = useState('England');
  const [corrMatrix, setCorrMatrix] = useState(null);
  const [corrTeams, setCorrTeams] = useState([]);
  const [corrLoading, setCorrLoading] = useState(true);
  const isMobile = ['xxs', 'xs', 'sm'].includes(bp);

  useEffect(() => {
    let cancelled = false;
    async function fetchCorrelationData() {
      setCorrLoading(true);
      try {
        const historyMap = {};
        const results = await Promise.all(
          CORR_TEAMS.map((team) => getOddsHistory(team, 30))
        );
        results.forEach((res, i) => {
          const teamName = CORR_TEAMS[i];
          if (res.data && res.data.length >= 3) {
            historyMap[teamName] = res.data;
          }
        });
        if (cancelled) return;
        const teams = Object.keys(historyMap);
        if (teams.length >= 2) {
          const matrix = buildCorrelationMatrix(historyMap);
          setCorrMatrix(matrix);
          setCorrTeams(teams);
        }
      } catch (err) {
        console.error('Correlation fetch error:', err);
      } finally {
        if (!cancelled) setCorrLoading(false);
      }
    }
    fetchCorrelationData();
    return () => { cancelled = true; };
  }, []);

  const radarData = ['ATK', 'DEF', 'MID', 'GK', 'SET', 'PHY'].map((stat) => ({
    stat,
    [teamA]: teamStats[teamA]?.[stat] || 0,
    [teamB]: teamStats[teamB]?.[stat] || 0,
  }));

  const gc = cardBox(theme);

  const sectionTitle = {
    fontSize: 10, color: theme.textMuted, ...headingStyle(theme), margin: '0 0 14px',
  };

  const selectStyle = {
    background: theme.card2, color: theme.text,
    border: `1px solid ${theme.border}`,
    borderRadius: theme.borderRadius, padding: '7px 12px', fontSize: 12,
    fontFamily: theme.fontHeading, textTransform: theme.textTransform,
    letterSpacing: theme.letterSpacing, cursor: 'pointer',
    appearance: 'none', WebkitAppearance: 'none',
  };

  return (
    <div style={{ padding: isMobile ? '16px 14px' : '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 11,
          background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentAlt})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 4px 16px ${theme.primaryGlow}`,
        }}>
          <BarChart3 size={18} color="#fff" />
        </div>
        <h2 style={{
          fontSize: 15, fontWeight: 600, color: theme.text, margin: 0,
          fontFamily: theme.fontHeading, textTransform: 'uppercase',
          letterSpacing: '0.12em',
        }}>
          ANALYSIS
        </h2>
      </div>

      {learning && <LearnOverlay section="polymarket" theme={theme} />}

      {/* Team selector pills */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20,
        flexWrap: 'wrap',
      }}>
        <select value={teamA} onChange={(e) => setTeamA(e.target.value)} style={selectStyle}>
          {teamNames.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
        <span style={{
          padding: '4px 10px', borderRadius: 8, fontSize: 10, fontWeight: 700,
          background: theme.primaryBg, color: theme.primary,
          fontFamily: theme.fontHeading, letterSpacing: '0.1em',
        }}>
          VS
        </span>
        <select value={teamB} onChange={(e) => setTeamB(e.target.value)} style={selectStyle}>
          {teamNames.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: 12, marginBottom: 16,
      }}>
        {/* Radar chart */}
        <div style={gc}>
          <h3 style={sectionTitle}>Team Comparison</h3>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData}>
              <PolarGrid stroke={theme.chartGrid} />
              <PolarAngleAxis dataKey="stat" tick={{ fill: theme.chartText, fontSize: 10, fontFamily: theme.fontData }} />
              <PolarRadiusAxis tick={{ fill: theme.chartText, fontSize: 9 }} domain={[0, 100]} />
              <Radar name={teamA} dataKey={teamA} stroke={theme.accent} fill={theme.primaryBg} fillOpacity={0.5} strokeWidth={2} />
              <Radar name={teamB} dataKey={teamB} stroke={theme.green} fill={theme.greenDim} fillOpacity={0.5} strokeWidth={2} />
              <Legend wrapperStyle={{ fontSize: 10, fontFamily: theme.fontData }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Head-to-head bars */}
        <div style={gc}>
          <h3 style={sectionTitle}>Head-to-Head</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {h2hStats.map((s) => {
              const total = s.home + s.away;
              return (
                <div key={s.stat}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 5,
                  }}>
                    <span style={{
                      color: theme.accent, fontFamily: theme.fontData, fontWeight: 700,
                      textShadow: `0 0 8px ${theme.primaryGlow}`,
                    }}>
                      {s.home}
                    </span>
                    <span style={{
                      color: theme.textMuted, fontFamily: theme.fontHeading,
                      textTransform: 'uppercase', fontSize: 9, letterSpacing: '0.1em',
                    }}>
                      {s.stat}
                    </span>
                    <span style={{
                      color: theme.green, fontFamily: theme.fontData, fontWeight: 700,
                      textShadow: `0 0 8px ${theme.greenGlow}`,
                    }}>
                      {s.away}
                    </span>
                  </div>
                  <div style={{ display: 'flex', height: 6, borderRadius: 3, gap: 3, overflow: 'hidden' }}>
                    <div style={{
                      width: `${(s.home / total) * 100}%`,
                      background: `linear-gradient(90deg, ${theme.accent}, ${theme.accentAlt})`,
                      borderRadius: 3, boxShadow: `0 0 6px ${theme.primaryGlow}`,
                    }} />
                    <div style={{
                      width: `${(s.away / total) * 100}%`,
                      background: `linear-gradient(90deg, ${theme.green}, ${theme.accentAlt})`,
                      borderRadius: 3, boxShadow: `0 0 6px ${theme.greenGlow}`,
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{
            display: 'flex', justifyContent: 'space-between', marginTop: 14,
            fontSize: 10, color: theme.textDim, fontFamily: theme.fontData,
          }}>
            <span>{teamA}</span>
            <span>{teamB}</span>
          </div>
        </div>
      </div>

      {/* All teams trend — full width */}
      <div style={gc}>
        <h3 style={sectionTitle}>All Teams — Odds Trend</h3>
        <ResponsiveContainer width="100%" height={isMobile ? 220 : 280}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.chartGrid} />
            <XAxis dataKey="month" tick={{ fill: theme.chartText, fontSize: 10, fontFamily: theme.fontData }} axisLine={false} />
            <YAxis tick={{ fill: theme.chartText, fontSize: 10, fontFamily: theme.fontData }} axisLine={false} domain={[0, 20]} />
            <Tooltip contentStyle={{
              background: theme.tooltipBg, border: `1px solid ${theme.tooltipBorder}`,
              borderRadius: 10, fontSize: 10, fontFamily: theme.fontData,
              backdropFilter: 'blur(12px)',
            }} />
            <Legend wrapperStyle={{ fontSize: 9, fontFamily: theme.fontData }} />
            {teamNames.map((name, i) => (
              <Line key={name} type="monotone" dataKey={name} stroke={lineColors[i]} strokeWidth={2} dot={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Team Correlations — heatmap matrix */}
      <div style={{ ...gc, marginTop: 12 }}>
        <h3 style={sectionTitle}>Team Correlations</h3>
        <p style={{
          fontSize: 10, color: theme.textDim, margin: '0 0 14px',
          fontFamily: theme.fontBody, lineHeight: 1.5,
        }}>
          Pearson correlation of odds movements. Green = move together, Red = move inversely.
        </p>

        {corrLoading ? (
          <div style={{
            textAlign: 'center', padding: 32, color: theme.textMuted,
            fontSize: 11, fontFamily: theme.fontData,
          }}>
            Loading correlation data...
          </div>
        ) : !corrMatrix || corrTeams.length < 2 ? (
          <div style={{
            textAlign: 'center', padding: 32, color: theme.textMuted,
            fontSize: 11, fontFamily: theme.fontData,
          }}>
            Not enough history data to compute correlations.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              borderCollapse: 'collapse', width: '100%', minWidth: corrTeams.length * 56,
            }}>
              <thead>
                <tr>
                  <th style={{
                    padding: '6px 8px', fontSize: 9, color: theme.textMuted,
                    fontFamily: theme.fontHeading, textTransform: theme.textTransform,
                    letterSpacing: theme.letterSpacing, textAlign: 'left',
                    borderBottom: `1px solid ${theme.border}`,
                  }} />
                  {corrTeams.map((t) => (
                    <th key={t} style={{
                      padding: '6px 4px', fontSize: 9, color: theme.textDim,
                      fontFamily: theme.fontData, textAlign: 'center',
                      borderBottom: `1px solid ${theme.border}`,
                      whiteSpace: 'nowrap',
                    }}>
                      {t.slice(0, 3).toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {corrTeams.map((rowTeam) => (
                  <tr key={rowTeam}>
                    <td style={{
                      padding: '6px 8px', fontSize: 10, color: theme.textDim,
                      fontFamily: theme.fontData, whiteSpace: 'nowrap',
                      borderBottom: `1px solid ${theme.border}`,
                    }}>
                      {rowTeam.slice(0, 3).toUpperCase()}
                    </td>
                    {corrTeams.map((colTeam) => {
                      const val = corrMatrix[rowTeam]?.[colTeam] ?? 0;
                      const isDiag = rowTeam === colTeam;
                      return (
                        <td key={colTeam} style={{
                          padding: '6px 4px', textAlign: 'center',
                          fontSize: 10, fontFamily: theme.fontData,
                          fontWeight: isDiag ? 400 : 600,
                          color: isDiag ? theme.textMuted : getCorrelationTextColor(val),
                          background: getCorrelationColor(val),
                          borderBottom: `1px solid ${theme.border}`,
                          borderRight: `1px solid ${theme.border}`,
                          transition: 'background 0.2s',
                        }}>
                          {isDiag ? '—' : val.toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Legend */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 16, marginTop: 12, flexWrap: 'wrap',
            }}>
              {[
                { label: 'Strong +', color: 'rgba(0,230,118,0.55)' },
                { label: 'Weak +', color: 'rgba(0,230,118,0.15)' },
                { label: 'Neutral', color: 'rgba(148,163,184,0.15)' },
                { label: 'Weak -', color: 'rgba(239,68,68,0.15)' },
                { label: 'Strong -', color: 'rgba(239,68,68,0.55)' },
              ].map((item) => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{
                    width: 12, height: 12, borderRadius: 3,
                    background: item.color, border: `1px solid ${theme.border}`,
                  }} />
                  <span style={{
                    fontSize: 9, color: theme.textMuted, fontFamily: theme.fontData,
                  }}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

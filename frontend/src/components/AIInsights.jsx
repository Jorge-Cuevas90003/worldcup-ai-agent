import { useState, useEffect, useCallback } from 'react';
import { Sparkles, RefreshCw, TrendingUp, AlertCircle, Target } from 'lucide-react';
import { cardBox, headingStyle, dataFont, animEntry } from '../utils/styles';

const BASE = import.meta.env.VITE_API_BASE_URL || '';

export default function AIInsights({ theme, isMobile }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalysis = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE}/api/aiAnalysis`);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  const analysis = data?.analysis;

  const sentimentColors = {
    bullish: theme.green,
    bearish: theme.red,
    neutral: theme.textDim,
    concentrated: theme.accent,
    distributed: theme.blue,
  };

  return (
    <div style={{ ...cardBox(theme), animation: animEntry(theme, 0) }}>
      {/* Accent stripe */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, ${theme.accent}, ${theme.accentAlt})`,
        opacity: 0.7,
      }} />

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 14,
      }}>
        <h3 style={{
          fontSize: 10, color: theme.textMuted, ...headingStyle(theme),
          margin: 0, display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <Sparkles size={12} color={theme.accent} /> AI Market Analysis
          {data?.source && (
            <span style={{
              fontSize: 8, padding: '1px 5px',
              borderRadius: Math.min(theme.borderRadius, 4),
              background: data.source === 'ai' ? theme.greenDim : theme.primaryBg,
              color: data.source === 'ai' ? theme.green : theme.textDim,
              fontWeight: 700, fontFamily: theme.fontData,
              marginLeft: 4,
            }}>
              {data.source === 'ai' ? 'LLM' : 'RULE-BASED'}
            </span>
          )}
        </h3>
        <button
          onClick={fetchAnalysis}
          disabled={loading}
          style={{
            background: theme.card2, border: `1px solid ${theme.border}`,
            borderRadius: Math.min(theme.borderRadius, 8), padding: '4px 10px',
            cursor: loading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: 4,
            color: theme.textDim, fontSize: 9, fontFamily: theme.fontData, fontWeight: 700,
            transition: 'all 0.2s',
          }}
        >
          <RefreshCw size={10} style={{
            animation: loading ? 'spin 1s linear infinite' : 'none',
          }} />
          REFRESH
        </button>
      </div>

      {/* Loading state */}
      {loading && !data && (
        <div style={{
          padding: '24px 0', textAlign: 'center',
          color: theme.textMuted, fontSize: 12, ...dataFont(theme),
        }}>
          Analyzing market data...
        </div>
      )}

      {/* Error state */}
      {error && !data && (
        <div style={{
          padding: '16px', borderRadius: Math.min(theme.borderRadius, 8),
          background: theme.redDim, color: theme.red,
          fontSize: 11, ...dataFont(theme),
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {/* Analysis content */}
      {analysis && (
        <div style={{ opacity: loading ? 0.6 : 1, transition: 'opacity 0.3s' }}>
          {/* Summary */}
          {analysis.summary && (
            <div style={{
              fontSize: 13, color: theme.text, lineHeight: 1.5,
              fontFamily: theme.fontBody, marginBottom: 14,
            }}>
              {analysis.summary}
            </div>
          )}

          {/* Sentiment badge */}
          {analysis.marketSentiment && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              fontSize: 9, fontWeight: 700, fontFamily: theme.fontData,
              padding: '3px 8px', borderRadius: Math.min(theme.borderRadius, 6),
              background: `${sentimentColors[analysis.marketSentiment] || theme.textDim}20`,
              color: sentimentColors[analysis.marketSentiment] || theme.textDim,
              textTransform: 'uppercase', marginBottom: 14,
            }}>
              <TrendingUp size={10} />
              {analysis.marketSentiment}
            </div>
          )}

          {/* Insights */}
          {analysis.insights && analysis.insights.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: 8, marginBottom: 14,
            }}>
              {analysis.insights.map((insight, i) => (
                <div key={i} style={{
                  padding: '10px 12px',
                  borderRadius: Math.min(theme.borderRadius, 10),
                  background: theme.card2,
                  border: `1px solid ${theme.border}`,
                  animation: animEntry(theme, i + 1),
                }}>
                  <div style={{
                    fontSize: 10, fontWeight: 700, color: theme.accent,
                    fontFamily: theme.fontHeading,
                    textTransform: theme.textTransform,
                    letterSpacing: theme.letterSpacing,
                    marginBottom: 4,
                  }}>
                    {insight.title}
                  </div>
                  <div style={{
                    fontSize: 11, color: theme.textDim, lineHeight: 1.4,
                    fontFamily: theme.fontBody,
                  }}>
                    {insight.detail}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Top Pick */}
          {analysis.topPick && (
            <div style={{
              padding: '12px 14px',
              borderRadius: Math.min(theme.borderRadius, 10),
              background: `linear-gradient(135deg, ${theme.primaryBg}, ${theme.card2})`,
              border: `1px solid ${theme.border}`,
              display: 'flex', alignItems: 'flex-start', gap: 10,
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: Math.min(theme.borderRadius, 8),
                background: theme.primaryBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Target size={14} color={theme.accent} />
              </div>
              <div>
                <div style={{
                  fontSize: 10, fontWeight: 700, color: theme.textMuted,
                  ...headingStyle(theme), marginBottom: 2,
                }}>
                  TOP PICK
                </div>
                <div style={{
                  fontSize: 14, fontWeight: 700, color: theme.accent,
                  fontFamily: theme.fontHeading,
                }}>
                  {analysis.topPick.team}
                </div>
                <div style={{
                  fontSize: 11, color: theme.textDim, marginTop: 2,
                  lineHeight: 1.4, fontFamily: theme.fontBody,
                }}>
                  {analysis.topPick.reason}
                </div>
              </div>
            </div>
          )}

          {/* Timestamp */}
          {data?.timestamp && (
            <div style={{
              fontSize: 9, color: theme.textMuted, ...dataFont(theme),
              marginTop: 10, textAlign: 'right',
            }}>
              {data.model && `${data.model} | `}
              {new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

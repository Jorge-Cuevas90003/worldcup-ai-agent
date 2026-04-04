import { useState } from 'react';
import { Trash2, Bell, BellOff, Plus } from 'lucide-react';
import { cardBox, headingStyle, dataFont } from '../utils/styles';
import FlagIcon from './FlagIcon';

const CONDITIONS = [
  { value: 'above', label: 'Above' },
  { value: 'below', label: 'Below' },
  { value: 'change_up', label: 'Change up' },
  { value: 'change_down', label: 'Change down' },
];

function conditionText(condition, threshold) {
  switch (condition) {
    case 'above': return `above ${threshold}%`;
    case 'below': return `below ${threshold}%`;
    case 'change_up': return `up ${threshold}%`;
    case 'change_down': return `down ${threshold}%`;
    default: return `${condition} ${threshold}%`;
  }
}

export default function AlertRulesPanel({ rules, teams, onAdd, onToggle, onDelete, theme }) {
  const [showForm, setShowForm] = useState(false);
  const [formTeam, setFormTeam] = useState('');
  const [formCondition, setFormCondition] = useState('above');
  const [formThreshold, setFormThreshold] = useState(10);

  const inputStyle = {
    padding: '7px 10px', borderRadius: theme.borderRadius,
    background: theme.card2, border: `1px solid ${theme.border}`,
    color: theme.text, fontSize: 12, fontFamily: theme.fontBody,
    outline: 'none',
  };

  function handleSave() {
    if (!formTeam) return;
    onAdd({ team: formTeam, condition: formCondition, threshold: Number(formThreshold) });
    setShowForm(false);
    setFormTeam('');
    setFormCondition('above');
    setFormThreshold(10);
  }

  // Find team objects for flag lookup
  const teamMap = {};
  (teams || []).forEach((t) => { teamMap[t.team] = t; });

  return (
    <div style={cardBox(theme)}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 14,
      }}>
        <h3 style={{
          fontSize: 10, color: theme.textMuted, ...headingStyle(theme),
          margin: 0, display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <Bell size={12} color={theme.accent} /> Alert Rules
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '4px 10px', borderRadius: Math.min(theme.borderRadius, 8),
            background: showForm ? theme.card2 : `linear-gradient(135deg, ${theme.accent}, ${theme.accentAlt})`,
            border: showForm ? `1px solid ${theme.border}` : 'none',
            color: showForm ? theme.textMuted : '#fff',
            fontSize: 10, fontWeight: 700, fontFamily: theme.fontHeading,
            cursor: 'pointer', textTransform: theme.textTransform,
            letterSpacing: theme.letterSpacing,
          }}
        >
          <Plus size={10} /> {showForm ? 'Cancel' : 'Add Rule'}
        </button>
      </div>

      {/* Inline add form */}
      {showForm && (
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'flex-end',
          padding: 12, marginBottom: 12, borderRadius: theme.borderRadius,
          background: theme.card2, border: `1px solid ${theme.border}`,
        }}>
          <div style={{ flex: '1 1 120px' }}>
            <label style={{ fontSize: 9, color: theme.textMuted, ...dataFont(theme), display: 'block', marginBottom: 3 }}>
              TEAM
            </label>
            <select
              value={formTeam}
              onChange={(e) => setFormTeam(e.target.value)}
              style={{ ...inputStyle, width: '100%', cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none' }}
            >
              <option value="">Select team...</option>
              {(teams || []).map((t) => (
                <option key={t.team} value={t.team}>{t.team}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: '1 1 100px' }}>
            <label style={{ fontSize: 9, color: theme.textMuted, ...dataFont(theme), display: 'block', marginBottom: 3 }}>
              CONDITION
            </label>
            <select
              value={formCondition}
              onChange={(e) => setFormCondition(e.target.value)}
              style={{ ...inputStyle, width: '100%', cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none' }}
            >
              {CONDITIONS.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: '0 0 70px' }}>
            <label style={{ fontSize: 9, color: theme.textMuted, ...dataFont(theme), display: 'block', marginBottom: 3 }}>
              THRESHOLD %
            </label>
            <input
              type="number" value={formThreshold}
              onChange={(e) => setFormThreshold(e.target.value)}
              min={0} max={100} step={0.5}
              style={{ ...inputStyle, width: '100%' }}
            />
          </div>
          <button
            onClick={handleSave}
            disabled={!formTeam}
            style={{
              padding: '7px 16px', borderRadius: theme.borderRadius,
              background: formTeam
                ? `linear-gradient(135deg, ${theme.accent}, ${theme.accentAlt})`
                : theme.card2,
              border: 'none', color: formTeam ? '#fff' : theme.textMuted,
              fontSize: 12, fontWeight: 700, fontFamily: theme.fontHeading,
              cursor: formTeam ? 'pointer' : 'default',
              textTransform: theme.textTransform, letterSpacing: theme.letterSpacing,
            }}
          >
            Save
          </button>
        </div>
      )}

      {/* Rules list */}
      {(!rules || rules.length === 0) ? (
        <div style={{
          fontSize: 12, color: theme.textDim, fontFamily: theme.fontBody,
          padding: '8px 0',
        }}>
          No alert rules yet. Add one to get notified when odds change.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {rules.map((rule) => {
            const t = teamMap[rule.team];
            return (
              <div key={rule.id} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 12px', borderRadius: Math.min(theme.borderRadius, 10),
                background: theme.card2, border: `1px solid ${theme.border}`,
                opacity: rule.enabled ? 1 : 0.5,
                transition: 'opacity 0.2s',
              }}>
                <FlagIcon team={rule.team} size={16} />
                <span style={{
                  fontSize: 12, fontWeight: 600, fontFamily: theme.fontHeading,
                  color: theme.text, flex: 1, minWidth: 0,
                }}>
                  {rule.team}
                  <span style={{
                    fontSize: 10, color: theme.textDim, fontWeight: 400,
                    fontFamily: theme.fontData, marginLeft: 8,
                  }}>
                    {conditionText(rule.condition, rule.threshold)}
                  </span>
                </span>

                {/* Toggle enabled */}
                <button
                  onClick={() => onToggle(rule.id, !rule.enabled)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: 4, lineHeight: 0,
                  }}
                  title={rule.enabled ? 'Disable rule' : 'Enable rule'}
                >
                  {rule.enabled
                    ? <Bell size={14} color={theme.accent} />
                    : <BellOff size={14} color={theme.textMuted} />
                  }
                </button>

                {/* Delete */}
                <button
                  onClick={() => onDelete(rule.id)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: 4, lineHeight: 0,
                  }}
                  title="Delete rule"
                >
                  <Trash2 size={14} color={theme.red || theme.textMuted} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

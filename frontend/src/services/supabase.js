import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Odds History ──
export async function saveOddsSnapshot(teams) {
  const rows = teams.map((t) => ({
    team: t.team,
    flag: t.flag,
    odds: t.odds,
    volume: t.volume || 0,
    source: 'polymarket',
  }));
  return supabase.from('odds_history').insert(rows);
}

export async function getOddsHistory(team, days = 30) {
  const since = new Date(Date.now() - days * 86400000).toISOString();
  return supabase
    .from('odds_history')
    .select('team, odds, volume, recorded_at')
    .eq('team', team)
    .gte('recorded_at', since)
    .order('recorded_at', { ascending: true });
}

// Fetch the most recent odds snapshot per team (for change calculation)
export async function getLatestOddsSnapshot() {
  // Get the most recent recorded_at timestamp (the last full snapshot)
  const { data: latest, error: err1 } = await supabase
    .from('odds_history')
    .select('recorded_at')
    .order('recorded_at', { ascending: false })
    .limit(1);

  if (err1 || !latest || latest.length === 0) return {};

  const latestTs = latest[0].recorded_at;

  // Get all rows from that snapshot (same recorded_at, or within 5 seconds)
  // Use a small window because rows from a single saveOddsSnapshot batch
  // may have slightly different timestamps
  const windowStart = new Date(new Date(latestTs).getTime() - 5000).toISOString();
  const { data, error } = await supabase
    .from('odds_history')
    .select('team, odds, recorded_at')
    .gte('recorded_at', windowStart)
    .lte('recorded_at', latestTs)
    .order('recorded_at', { ascending: false });

  if (error || !data) return {};

  // Keep only the latest odds per team
  const map = {};
  for (const row of data) {
    if (!map[row.team]) {
      map[row.team] = row.odds;
    }
  }
  return map;
}

// ── Alerts ──
export async function saveAlert(alert) {
  return supabase.from('alerts').insert(alert);
}

export async function getUserAlerts(userId, limit = 50) {
  return supabase
    .from('alerts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
}

// ── Watchlists ──
export async function getWatchlist(userId) {
  return supabase
    .from('watchlists')
    .select('team')
    .eq('user_id', userId);
}

export async function addToWatchlist(userId, team) {
  return supabase
    .from('watchlists')
    .upsert({ user_id: userId, team }, { onConflict: 'user_id,team' });
}

export async function removeFromWatchlist(userId, team) {
  return supabase
    .from('watchlists')
    .delete()
    .eq('user_id', userId)
    .eq('team', team);
}

// ── Alert Rules ──
export async function getAlertRules(userId) {
  return supabase
    .from('alert_rules')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
}

export async function createAlertRule(rule) {
  return supabase.from('alert_rules').insert(rule);
}

export async function updateAlertRule(id, updates) {
  return supabase.from('alert_rules').update(updates).eq('id', id);
}

export async function deleteAlertRule(id) {
  return supabase.from('alert_rules').delete().eq('id', id);
}

// ── User Preferences ──
export async function getUserPreferences(userId) {
  return supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();
}

export async function upsertUserPreferences(userId, prefs) {
  return supabase
    .from('user_preferences')
    .upsert({ user_id: userId, ...prefs, updated_at: new Date().toISOString() });
}

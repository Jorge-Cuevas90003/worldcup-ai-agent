import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://sqyjbpaxnxoqffycsmnf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxeWpicGF4bnhvcWZmeWNzbW5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2NDc4MjEsImV4cCI6MjA5MDIyMzgyMX0.oR5ur0BPPD92RbyoPr2l6JAkcEPhIAmFIVitw4MxW6Y';

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

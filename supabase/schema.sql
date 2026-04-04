-- WorldCup Agent — Supabase Schema
-- Run this in Supabase SQL Editor (supabase.com → SQL Editor → New Query)

-- ═══════════════════════════════════════════
-- 1. ODDS HISTORY — Polymarket snapshots
-- ═══════════════════════════════════════════
create table if not exists odds_history (
  id bigint generated always as identity primary key,
  team text not null,
  flag text,
  odds numeric(6,2) not null,
  volume numeric(15,2),
  source text default 'polymarket',
  recorded_at timestamptz default now()
);

create index idx_odds_team_time on odds_history (team, recorded_at desc);

-- ═══════════════════════════════════════════
-- 2. ALERTS — Sent alert history
-- ═══════════════════════════════════════════
create table if not exists alerts (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade,
  team text not null,
  flag text,
  previous_odds numeric(6,2),
  current_odds numeric(6,2),
  change numeric(6,2),
  type text check (type in ('hot', 'drop', 'info')),
  severity int default 0,
  message text,
  detail text,
  channels text[] default '{}', -- {'gmail', 'slack', 'calendar'}
  sent boolean default false,
  created_at timestamptz default now()
);

create index idx_alerts_user on alerts (user_id, created_at desc);

-- ═══════════════════════════════════════════
-- 3. WATCHLISTS — Teams users follow
-- ═══════════════════════════════════════════
create table if not exists watchlists (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade,
  team text not null,
  created_at timestamptz default now(),
  unique(user_id, team)
);

-- ═══════════════════════════════════════════
-- 4. ALERT RULES — Custom thresholds
-- ═══════════════════════════════════════════
create table if not exists alert_rules (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade,
  team text not null,
  condition text check (condition in ('above', 'below', 'change_up', 'change_down')),
  threshold numeric(6,2) not null,
  channels text[] default '{gmail}',
  enabled boolean default true,
  last_triggered_at timestamptz,
  created_at timestamptz default now()
);

create index idx_rules_user on alert_rules (user_id);

-- ═══════════════════════════════════════════
-- 5. USER PREFERENCES
-- ═══════════════════════════════════════════
create table if not exists user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  theme text default 'midnight-gold',
  mode text default 'lite' check (mode in ('lite', 'pro')),
  alert_frequency text default 'realtime' check (alert_frequency in ('realtime', 'hourly', 'daily')),
  connections jsonb default '{}', -- {"gmail": true, "slack": true, "calendar": false}
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ═══════════════════════════════════════════
-- 6. ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════

-- odds_history: anyone can read, only service role can write
alter table odds_history enable row level security;
create policy "Anyone can read odds" on odds_history for select using (true);

-- alerts: users see only their own
alter table alerts enable row level security;
create policy "Users see own alerts" on alerts for select using (auth.uid() = user_id);
create policy "Service can insert alerts" on alerts for insert with check (true);

-- watchlists: users manage their own
alter table watchlists enable row level security;
create policy "Users see own watchlist" on watchlists for select using (auth.uid() = user_id);
create policy "Users add to watchlist" on watchlists for insert with check (auth.uid() = user_id);
create policy "Users remove from watchlist" on watchlists for delete using (auth.uid() = user_id);

-- alert_rules: users manage their own
alter table alert_rules enable row level security;
create policy "Users see own rules" on alert_rules for select using (auth.uid() = user_id);
create policy "Users create rules" on alert_rules for insert with check (auth.uid() = user_id);
create policy "Users update rules" on alert_rules for update using (auth.uid() = user_id);
create policy "Users delete rules" on alert_rules for delete using (auth.uid() = user_id);

-- user_preferences: users manage their own
alter table user_preferences enable row level security;
create policy "Users see own prefs" on user_preferences for select using (auth.uid() = user_id);
create policy "Users upsert prefs" on user_preferences for insert with check (auth.uid() = user_id);
create policy "Users update prefs" on user_preferences for update using (auth.uid() = user_id);

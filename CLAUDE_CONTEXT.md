# WorldCup Agent — Development Context

This file documents all decisions, services, and state for continuing development on any machine.

## Services Configured

### Vercel (Hosting + Serverless)
- **URL**: https://worldcup-agent.vercel.app
- **Project**: harmonyforgelabs-2152s-projects/worldcup-agent
- **Login**: `vercel login` in terminal

### Supabase (Database)
- **URL**: https://sqyjbpaxnxoqffycsmnf.supabase.co
- **Project**: worldcup-agent
- **Tables**: odds_history, alerts, watchlists, alert_rules, user_preferences
- **Schema**: see `supabase/schema.sql`

### Auth0 (Token Vault)
- **Tenant**: dev-nq374ll31kn8pv20.us.auth0.com
- **App**: WorldCup Agent (Single Page Application)
- **Connections**: Google OAuth2 (gmail.send, calendar.events), Slack (chat:write)
- **Token Vault**: Enabled for Connected Accounts

### Firebase (legacy, mostly replaced by Supabase)
- **Project**: worldcup-agent
- **Used for**: Hosting (backup), Firestore (legacy)

### Polymarket
- **API**: https://gamma-api.polymarket.com
- **Event slug**: 2026-fifa-world-cup-winner-595
- **Rate limit**: 24,000 req/min (we do 1 every 15s)

## Environment Variables (Vercel)
All set in Vercel dashboard (Settings > Environment Variables):
- AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, AUTH0_AUDIENCE
- CRON_SECRET, APP_URL, FIREBASE_PROJECT_ID

## What's Built

### Frontend (React 18 + Vite)
- 6 pages: Dashboard, Alerts, Matches, Analysis, Connections, Callback
- 15+ components with Theme DNA system (11 themes, each visually distinct)
- 3 modes: Lite (casual), Pro (trader), Learning (educational tooltips)
- Real SVG flags from flagcdn.com (80+ countries)
- PWA with manifest + service worker
- Animated numbers, confetti, hover micro-interactions
- 7-step onboarding tour highlighting Auth0 Token Vault

### Backend (Vercel Serverless)
- /api/getOdds — Live odds from Polymarket
- /api/connectService — Auth0 authorization URL generator
- /api/authCallback — OAuth callback handler
- /api/cron/checkOdds — Daily cron for alert detection
- /api/proxy — CORS proxy for Polymarket

### Analytics Engine
- ELO-style power ratings
- Smart money detection
- Edge calculator (Polymarket vs historical WC win rates)
- Trend strength (ADX-inspired)
- Market efficiency scoring
- Weighted velocity + volatility
- Composite sentiment

### Database (Supabase)
- odds_history — snapshots every 15s when users visit
- alerts — persisted when detected
- watchlists — star favorite teams
- alert_rules — custom thresholds (component created, not fully wired)
- user_preferences — theme, mode persistence

## Hackathon Submissions
- **Auth0 "Authorized to Act"**: https://authorizedtoact.devpost.com/ (deadline April 7)
- **ZerveHack**: https://zervehack.devpost.com/ (deadline April 29)

## What's Left for Auth0 Submission
1. Demo video (3 min) — show Auth0 Token Vault flow
2. Blog post (250+ words) — about Token Vault
3. Submit on Devpost with repo URL + live URL + video

## Local Dev
```bash
cd frontend && npm run dev   # Frontend on localhost:5173
vercel dev                    # Full stack with API routes
vercel --prod                 # Deploy to production
```

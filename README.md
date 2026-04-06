# WorldCup Agent

**Live FIFA World Cup 2026 odds tracker powered by Polymarket + Auth0 Token Vault**

> Built for the [Auth0 "Authorized to Act" Hackathon](https://authorizedtoact.devpost.com/) and [ZerveHack](https://zervehack.devpost.com/)

## Live Demo

**https://worldcup-agent.vercel.app**

## What It Does

An AI agent web app that monitors World Cup 2026 betting odds from Polymarket in real-time and sends alerts when significant shifts occur via Gmail and Google Calendar, all authenticated securely through **Auth0 Token Vault**.

## Architecture

```
                    User Browser
                         |
                    React + Vite
                    (worldcup-agent.vercel.app)
                         |
              +----------+-----------+
              |                      |
         Polymarket API         Vercel Serverless
         (live odds)            Functions (API)
              |                      |
              |              +-------+-------+
              |              |               |
              |         Auth0 Token      Supabase
              |           Vault            (DB)
              |              |               |
              |     +--------+--------+      |
              |     |                |      |
              |   Gmail         Calendar   |
              |   API     API     API        |
              |                              |
              +--------- odds_history -------+
                         alerts
                         watchlists
```

## Auth0 Token Vault Flow

This is the core hackathon feature. The agent uses Auth0 Token Vault to:

1. **Authenticate** - User clicks "Connect Gmail" in the app
2. **Consent** - Redirects to Auth0 which redirects to Google OAuth consent
3. **Store** - Auth0 Token Vault stores the OAuth tokens securely
4. **Refresh** - Tokens are auto-refreshed by Auth0 (no manual intervention)
5. **Use** - When odds shift, the agent retrieves the stored token and calls Gmail/Calendar API

```
App -> Auth0 /authorize -> Google Consent -> Token Vault -> Auto Refresh -> Gmail API
```

**Security principles:**
- Tokens are NEVER stored in our application or browser
- Only minimum scopes requested (gmail.send, calendar.events)
- User can revoke access at any time
- All token lifecycle managed by Auth0

## Features

| Feature | Description |
|---------|-------------|
| Live Odds | 23+ teams from Polymarket, polling every 15 seconds |
| Smart Alerts | Detects odds surges/drops, sends via Gmail + Calendar |
| Auth0 Token Vault | Secure OAuth token storage with auto-refresh |
| Lite/Pro Modes | Casual fan view vs trader analytics dashboard |
| 11 Themes | Each with unique typography, borders, shadows, animations |
| Market Intelligence | Sentiment scoring, velocity tracking, volatility index |
| Watchlists | Star and track favorite teams |
| Portfolio Simulator | Calculate potential returns on bets |
| Permission Dashboard | Shows exactly what the agent can and cannot do |
| Security Log | Token lifecycle audit trail |
| PWA | Installable as a native app on mobile/desktop |
| Real SVG Flags | 80+ country flags via flagcdn.com |

## Tech Stack

| Layer | Technology | Cost |
|-------|-----------|------|
| Frontend | React 18 + Vite | Free |
| Hosting | Vercel | Free |
| Database | Supabase (PostgreSQL) | Free tier |
| Auth | Auth0 Token Vault | Free tier |
| Data Source | Polymarket Gamma API | Free (public) |
| Charts | Recharts | MIT license |
| Icons | Lucide React | ISC license |
| Flags | flagcdn.com SVGs | Free |

**Total cost: $0**

## Project Structure

```
worldcup-agent/
├── api/                    # Vercel Serverless Functions
│   ├── _lib/
│   │   ├── auth0.js        # TokenVault class (Auth0 Management API)
│   │   ├── config.js       # Configuration + team flags
│   │   ├── notifications.js # Gmail + Calendar alert senders
│   │   └── polymarket.js   # Polymarket API client
│   ├── connectService.js   # Generate Auth0 authorization URL
│   ├── authCallback.js     # OAuth callback handler
│   ├── getOdds.js          # Get current odds
│   └── cron/checkOdds.js   # Daily cron job for alerts
│
├── frontend/               # React SPA
│   ├── src/
│   │   ├── components/     # 15+ reusable components
│   │   ├── pages/          # 6 pages
│   │   ├── config/themes.js # 11 themes with Style DNA system
│   │   ├── utils/styles.js # Theme-aware style resolver
│   │   ├── services/       # Polymarket, Supabase, Auth0, Analytics
│   │   └── hooks/          # useTheme, useMode, useBreakpoint
│   └── public/             # PWA manifest, service worker, favicon
│
├── supabase/schema.sql     # Database schema (5 tables + RLS)
└── vercel.json             # Deployment config + cron
```

## Setup

```bash
# Clone
git clone https://github.com/YOUR_USERNAME/worldcup-agent.git
cd worldcup-agent

# Install
npm install && cd frontend && npm install && cd ..

# Environment variables (Auth0 credentials)
cp .env.example .env

# Run locally
cd frontend && npm run dev

# Deploy
vercel --prod
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `AUTH0_DOMAIN` | Your Auth0 tenant domain |
| `AUTH0_CLIENT_ID` | Auth0 application client ID |
| `AUTH0_CLIENT_SECRET` | Auth0 application client secret |
| `AUTH0_AUDIENCE` | Auth0 Management API audience |
| `CRON_SECRET` | Secret for cron job authentication |

## Licenses

All dependencies are open source (MIT, ISC, Apache 2.0). No copyrighted assets. Country flags from [flagcdn.com](https://flagcdn.com) (free, open source).

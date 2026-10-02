# OPTALIVE — Elite Professional Football Analytics & Live Telemetry

OPTALIVE is an enterprise-grade football intelligence and live match telemetry platform. It provides real-time scores, verified match statistics, expected goals (xG), lineup tactical formations, league tables, and server-side grounded AI football intelligence powered by Google Gemini (`gemini-3.8-flash`).

---

## 1. System Architecture

OPTALIVE follows a unified, full-stack reactive architecture designed to prevent data inconsistencies, client secret leaks, and ungrounded hallucinations.

```
                      ┌──────────────────────────────────────┐
                      │          React 19 SPA (Vite)         │
                      │   Tailwind CSS • Reusable Components │
                      └──────────────────┬───────────────────┘
                                         │  Client-Side REST
                                         ▼
                      ┌──────────────────────────────────────┐
                      │      Express 4 API Server (Node)      │
                      │  Input Validation • Security Headers │
                      │  Rate Limiting • Secret Isolation    │
                      └──────────┬─────────────────┬─────────┘
                                 │                 │
              Provider Routing   │                 │  Grounded Telemetry
                                 ▼                 ▼
             ┌─────────────────────────┐     ┌─────────────────────────┐
             │   Football Repository   │     │  Gemini Football Intel  │
             │   & Normalized Model    │     │  (gemini-3.8-flash)     │
             └───────────┬─────────────┘     └─────────────────────────┘
                         │
         ┌───────────────┴────────────────┐
         ▼                                ▼
┌──────────────────┐            ┌──────────────────┐
│ Sportmonks v3    │            │ Verified Ref.    │
│ Live API Engine  │            │ Telemetry Engine │
└──────────────────┘            └──────────────────┘
```

### Key Architectural Tenets

1. **Single Normalized Data Model (`src/types/football.ts`)**: All match feeds, club profiles, squads, standings, and events conform to a single schema regardless of the underlying data source.
2. **One API Service Layer (`src/api/footballClient.ts`)**: The frontend interacts exclusively with our local Express backend proxy (`/api/*`). The browser client never touches third-party credentials.
3. **Dual-Tier Data Layer**: Automatic fallback between upstream Sportmonks Football API v3 and high-fidelity reference telemetry with stale cache mitigation.
4. **Strict Grounded AI Reasoning**: Gemini only evaluates verified structured statistics supplied by the backend. It has strict negative prompts prohibiting hallucinated scores, lineups, or transfers, and output is validated against a strict JSON schema.

---

## 2. Environment Variables

Create a `.env` file in the project root based on `.env.example`:

| Variable | Required | Default | Description |
| :--- | :--- | :--- | :--- |
| `PORT` | Optional | `3000` | Port for the Express backend and Vite middleware. |
| `NODE_ENV` | Optional | `development` | Runtime environment (`development` \| `production`). |
| `GEMINI_API_KEY` | Optional | *Unset* | Google Gemini API key for tactical match analysis. If unset, deterministic rules engine activates. |
| `SPORTMONKS_API_TOKEN`| Optional | *Unset* | Sportmonks Football v3 API token. If unset, high-fidelity verified reference feeds serve data. |

> **Security Guarantee**: Neither `GEMINI_API_KEY` nor `SPORTMONKS_API_TOKEN` are prefixed with `VITE_`. They are inaccessible to the browser bundle.

---

## 3. Local Development

### Prerequisites

- Node.js 20+
- npm 10+

### Installation & Run

```bash
# 1. Install dependencies
npm install

# 2. Start the unified development server
npm run dev
```

The application will be live at `http://localhost:3000`.

---

## 4. API Endpoints Reference

### Core Telemetry Routes
- `GET /api/status`: System health, active provider (`live-sportmonks` or `verified-reference`), Gemini status.
- `GET /api/football/live`: Live matches with real-time score, minute, and momentum telemetry.
- `GET /api/football/fixtures?date=today&competitionId=epl`: Fixture schedule by date and league.
- `GET /api/football/matches/:id`: Full match center telemetry (overview, statistics, events, lineups, player ratings).
- `GET /api/football/leagues/:id/standings`: Official league tables with UCL/UEL/Relegation zones.
- `GET /api/football/teams/:id/profile`: Club profile, squad list, form guide, upcoming fixtures.
- `GET /api/football/players/:id/profile`: Player career statistics, radar attributes, form history.
- `GET /api/football/search?q=:query`: Debounced global search across clubs, players, leagues, and fixtures.
- `GET /api/football/news`: Verified football news and tactical analysis articles.

### AI Football Intelligence Layer
- `POST /api/ai/football-intelligence`:
  ```json
  {
    "fixtureId": "fix-live-01",
    "type": "MATCH_INSIGHT | TEAM_FORM_ANALYSIS | PLAYER_PERFORMANCE_SUMMARY | POST_MATCH_SUMMARY",
    "playerId": "ply-01" // Optional
  }
  ```

---

## 5. Google AI Studio Setup

1. In the Google AI Studio project settings or environment variables, configure `GEMINI_API_KEY`.
2. The server loads `@google/genai` using the alias model `gemini-3.8-flash`.
3. In `metadata.json`, the capability is declared:
   ```json
   {
     "majorCapabilities": [
       "MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API"
     ]
   }
   ```
4. If `GEMINI_API_KEY` is not present, the built-in deterministic tactical engine generates verified analytical insights without failing or blocking the UI.

---

## 6. Testing & Quality Assurance

Run type-checking and production builds:

```bash
# 1. Validate TypeScript across frontend and server
npm run lint

# 2. Compile production bundle
npm run build

# 3. Start production server
npm start
```

---

## 7. Security Hardening

- **Content Security Policy (CSP)**: Headers permit framing solely by trusted preview hosts (`https://*.google.com`, `https://*.run.app`, and `self`).
- **Input Validation**: `FootballValidator` verifies all route parameters against regex patterns to eliminate path traversal (`../`) and script injection (`<script>`).
- **SSRF Protection**: Upstream provider URLs are strictly whitelisted to official HTTPS endpoints.
- **Header Discipline**: Includes `X-Content-Type-Options: nosniff`, `X-XSS-Protection: 1; mode=block`, and `Referrer-Policy: strict-origin-when-cross-origin`.

---

## 8. Supported Competitions

- **Premier League** (`epl`) — England
- **La Liga** (`laliga`) — Spain
- **Serie A** (`seriea`) — Italy
- **Bundesliga** (`bundesliga`) — Germany
- **Ligue 1** (`ligue1`) — France
- **UEFA Champions League** (`ucl`) — Europe

---

## 9. Data Provider Limitations & Disclaimers

1. **Biometric & Physical Data**: Player sprint distances, top speed, and internal heart rates are proprietary club data not accessible in open feeds.
2. **Medical & Injury Prognoses**: Medical recovery timetables are estimated based on public club statements; they are never diagnosed or extrapolated by the AI layer.
3. **Editorial Disclaimer**: AI-generated analytical interpretation is based strictly on normalized match telemetry. It is not official Opta editorial commentary or broadcaster claim.

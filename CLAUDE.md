# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Quil Forge is a fiction writing platform (monorepo) with three apps:
- `apps/web` — React 18 + Vite frontend
- `apps/api` — Node.js/Express backend API
- `apps/pocketbase` — PocketBase binary (self-hosted database)

The project files are distributed as zip archives at the repo root. Extract the latest zip before making changes:
```bash
unzip "horizons-export-*.zip" -d extracted/
```
All source edits are made inside `extracted/`, then committed and pushed.

## Commands

Run from the **repo root** (or the monorepo root inside `extracted/`):

```bash
# Install all dependencies (workspaces)
npm install

# Start all three services concurrently (web on :3000, api on :3001, pocketbase on :8090)
npm run dev

# Build web app only
npm run build

# Start api + pocketbase (production mode, no Vite dev server)
npm run start

# Lint web + api
npm run lint

# Per-app dev (from apps/web or apps/api)
npm run dev --prefix apps/web
npm run dev --prefix apps/api
```

There is no test suite configured.

## Environment Variables

`apps/web/.env.local`:
- `VITE_STRIPE_PUBLISHABLE_KEY`

`apps/api/.env`:
- `PORT` (default 3001)
- `CORS_ORIGIN`
- `OPENAI_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_PRICE_ID_SCRIBE` / `STRIPE_PRICE_ID_ARCHMAGE`
- `STRIPE_WEBHOOK_SECRET`
- `POCKETBASE_URL` (defaults to `http://127.0.0.1:8090`)

## Architecture

### Data model hierarchy
```
Project → Book → Chapter → Scene
Project → Character
Project → World (locations, lore)
Project → Timeline events
```
All PocketBase collection rules filter by `userId = @request.auth.id`.

### Frontend context stack (in `src/main.jsx` wrap order)
1. `ThemeProvider` — dark/light theme
2. `AuthProvider` — PocketBase auth, session, 401 global interceptor, subscription status
3. `SubscriptionProvider` — fetches `subscriptions` collection record
4. `ProjectProvider` — active project selection (persisted to `localStorage`)
5. `AutoSaveProvider` — tracks in-flight saves globally; surfaces `AutoSaveIndicator`

### Routing
- Public marketing pages: `/`, `/about`, `/features`, `/pricing`, `/contact`
- Auth flows: `/login`, `/signup`, `/forgot-password`, `/reset-password/:token`
- Stripe result pages: `/success`, `/cancel`, `/subscription-success`
- All app pages are under `/app/*` and wrapped in `<ProtectedRoute>` (requires auth)
- Feature-gated routes additionally wrapped in `<ProtectedFeatureRoute feature="...">` which redirects to `/pricing` and shows a toast if the user lacks the required subscription tier

### API server (`apps/api`)
Express app with:
- `/health` — health check
- `/webhook` — Stripe webhook (registered **before** JSON body parser to get raw body)
- `/stripe/*` — subscription management, checkout sessions, price listing
- `/timeline`, `/relationships`, `/beta-guild`, `/export`, `/series`, `/collaboration` — premium feature routes, protected by `tierCheck(requiredTier)` middleware
- `/generate-names` — public utility (OpenAI-powered)

### Subscription tiers
Two tiers exist in Stripe and the `tierCheck` middleware: `SCRIBE` and `ARCHMAGE`. The frontend `tierBenefits` in `src/lib/tierBenefits.js` currently maps only `paid` (displayed as "Writer Plan"). `useFeatureAccess` hook reads `subscriptionStatus` and `subscriptionPlan` from `AuthContext` to gate features.

### PocketBase client
`src/lib/pocketbaseClient.js` points to `/hcgi/platform` (reverse-proxied). The API server uses its own `utils/pocketbaseClient.js` pointing to `process.env.POCKETBASE_URL`.

### Auto-save pattern
`useAutoSave(collectionName, recordId, data, debounceMs)` — debounces PocketBase `.update()` calls. Uses `retryWithBackoff` from `src/lib/autoSaveManager.js`. The `AutoSaveContext` aggregates all active saves and exposes a global dirty/saving state consumed by `AutoSaveIndicator`.

### Export
`src/lib/ExportService.js`, `ManuscriptExportService.js`, and `ManuscriptCompilationService.js` handle client-side export to PDF (`jspdf`), Word (`docx`), and ePub. The `/export` API route is for server-side compilation.

### AI features
`QuillAIAssistant` / `AIAssistant` components call `apps/api` endpoints (`/openai`, `/ai-writing-suggestions`, `/ai-advanced`) which proxy to OpenAI. Rate limiting is enforced server-side; `useAIRateLimit` hook tracks client-side.

### Path alias
`@/` maps to `apps/web/src/` (configured in `vite.config.js` and ESLint).

## Known Issues (from audit)

- Most list views use `getFullList()` with no pagination — will degrade for large datasets
- No PocketBase real-time subscriptions; multi-tab edits can cause data loss
- Deleting a Book/Chapter does not cascade-delete children (orphaned records)
- Some export options show success toasts without generating files

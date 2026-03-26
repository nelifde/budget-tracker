# Product Requirements Document — ADHD Budget Tracker

> A utilitarian, gamified budget tracker that reduces decision fatigue: pull-down to log, one question (Planned or Impulsive?), a massive Safe to Spend Today number, XP bar for budget health, and an AI coach that nudges reflection on impulsive patterns.

---

## 1. Product Overview

### Target User

People with ADHD (or ADHD-adjacent executive-function challenges) who struggle with impulsive spending, budget tracking friction, and financial shame.

### Core Thesis

Traditional budgeting apps demand too many decisions. This app strips logging to one gesture and one question, gamifies discipline with an XP bar, and uses a warm AI coach to build spending self-awareness — never guilt.

### Design Philosophy

| Principle | Detail |
|-----------|--------|
| **Vibe** | Utilitarian, distraction-free, heavily gamified |
| **Copy** | "Hype Man" — high energy, encouraging, never clinical or judgmental |
| **Theme** | System light/dark. Backgrounds: deep black (dark) / pure white (light). Neon accents (electric green, cyber purple) reserved for XP bar, rewards, and core actions only |
| **Typography** | Space Grotesk — tech/arcade, big, chunky, futuristic. Critical numbers are massive and dominant |
| **Input** | Pull-down gesture to log (no tiny FAB buttons). Numpad → one question → done |

Full design and stack constraints are in [`DESIGN_AND_STACK.md`](DESIGN_AND_STACK.md).

---

## 2. Current State

### Architecture

Monorepo with three top-level directories:

```
budget-tracker/
├── backend/          Express + TypeScript + Prisma → PostgreSQL
├── frontend/         Next.js 15 (App Router) + Tailwind + Framer Motion
├── docker-compose.yml
├── DESIGN_AND_STACK.md
└── PRD.md            (this file)
```

| Layer | Stack |
|-------|-------|
| **Backend** | Express, TypeScript, Prisma ORM, PostgreSQL, jsonwebtoken, bcryptjs, helmet, cors, morgan |
| **Frontend** | Next.js 15 (App Router), React 18, Tailwind CSS, Framer Motion, @use-gesture/react, TanStack React Query |
| **Tooling** | Biome (frontend linting), ts-node-dev (backend dev server) |
| **Deploy** | Docker Compose (Postgres 16 + backend:4000 + frontend:3000), Next.js `output: "standalone"` |

### Data Model

```
User
 ├── Account[]          (CASH, BANK, CARD)
 ├── Category[]         (INCOME | EXPENSE, color, icon)
 ├── Budget[]           (name, amount, period, optional category)
 ├── Transaction[]      (amount, date, note, spendType: PLANNED | IMPULSIVE)
 ├── Goal[]             (name, targetAmount, currentAmount, targetDate) ← schema only, no API
 ├── CoachPrompt[]      (promptKey, shownAt — dedup tracking)
 ├── Reflection[]       (feelingKey, reasonKey, optional category)
 └── CoachCheckIn[]     (prompt, dueAt, status, source: "ai" | "fallback")
```

`User` stores `monthlyBudgetAmount`, `currency`, and `simplified` (UI density toggle).

### API Surface

All routes are under `/api` and require auth (JWT or dev `x-user-id` header).

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/health` | Health check (no auth) |
| GET | `/api/summary/safe-to-spend` | Hero metric: safe-to-spend today, XP %, remaining, spent today/month |
| POST | `/api/quick/expense` | Quick-add: `{ amount, spendType, accountId?, categoryId?, note? }` |
| GET | `/api/coach/reflection` | Get one reflection prompt (or null) based on impulsive history |
| POST | `/api/coach/reflection` | Submit a reflection: `{ feelingKey, reasonKey, categoryId? }` |
| GET | `/api/coach/reminder` | Context-aware reminder text |
| GET | `/api/coach/check-in` | Active check-in (due, prompt, source) |
| POST | `/api/coach/check-in/:id/dismiss` | Dismiss a check-in |
| POST | `/api/coach/check-in/:id/complete` | Complete a check-in |
| GET | `/api/accounts` | List accounts |
| POST | `/api/accounts` | Create account |
| GET | `/api/user/settings` | Get user settings |
| PATCH | `/api/user/settings` | Update settings (currency, monthlyBudgetAmount, etc.) |
| GET | `/api/categories` | List categories |
| GET | `/api/transactions` | List transactions (supports `from`, `to`, `limit` query params) |
| DELETE | `/api/transactions/:id` | Delete a transaction |
| GET | `/api/budgets` | List budget lines (supports `year`, `month` query params) |
| POST | `/api/budgets` | Create a budget line |
| DELETE | `/api/budgets/:id` | Delete a budget line |

### Authentication (current)

- **JWT**: `Authorization: Bearer <token>` verified against `JWT_SECRET`.
- **Dev mode**: `x-user-id` header accepted when `NODE_ENV !== "production"`. Frontend auto-generates a random dev ID and persists it in `localStorage`.
- No login/signup UI, OAuth flow, or token refresh exists yet.

### Frontend Architecture

Single-page app at `/` with sheet-based navigation (no client-side routing beyond the root). State management via React Query for server data and local `useState` for sheet open/closed states.

| Component | Role |
|-----------|------|
| `HomeScreen` | Hero: Safe to Spend Today (massive number), XP bar, navigation to sheets. Pull-down gesture triggers quick-add |
| `QuickAddSheet` | Numpad → amount → Planned or Impulsive → optional details → submit |
| `BudgetSheet` | View/create/delete budget lines for current month |
| `SettingsSheet` | Monthly budget amount, currency, simplified toggle |
| `SpendingsScreen` | Full-screen transaction list with swipe-to-delete |
| `ReflectionLogSheet` | Feeling + reason picker, tied to coach prompt |
| `ReflectionsMockupSheet` | Exploratory reflections UI (mockup) |
| `CoachBanner` | Reflection prompt banner on home screen |
| `CoachCheckInBanner` | Check-in due banner |
| `NudgeBanner` | General nudge/reminder |
| `SwipeableRow` | Swipe gesture wrapper (used in transaction list) |

### AI Coach

- Uses OpenAI API (`gpt-4o-mini` by default, configurable via `AI_COACH_API_URL` / `AI_COACH_MODEL`).
- System prompt: "ADHD-friendly budget coach. Warm, short, non-judgmental. Under 35 words."
- Generates three kinds of prompts: `reflection`, `checkin`, `reminder`.
- Falls back to hardcoded prompts when API key is missing or call fails (5s timeout).
- Output is sanitized (no "buy now", no "guarantee", max 220 chars).

---

## 3. User Flows (implemented)

### Quick-Add Expense

```
Home (Safe to Spend Today)
  │  pull-down gesture
  ▼
QuickAddSheet opens
  │  enter amount on numpad
  ▼
"Planned or Impulsive?" (one tap)
  │  optional: "Add Details" → category, note
  ▼
POST /api/quick/expense
  │  invalidate safe-to-spend, transactions, coach queries
  ▼
Sheet closes → Home refreshes
```

### View Spendings

```
Home → tap spendings
  ▼
SpendingsScreen (full-screen transaction list)
  │  swipe left on row → delete
  ▼
DELETE /api/transactions/:id → list refreshes
```

### Manage Budgets

```
Home → tap budget icon
  ▼
BudgetSheet → view current month's budget lines
  │  add new line (name + amount) or delete existing
  ▼
POST/DELETE /api/budgets → safe-to-spend recalculates
```

### Settings

```
Home → tap settings
  ▼
SettingsSheet → monthly budget, currency
  ▼
PATCH /api/user/settings → safe-to-spend recalculates
```

### Coach Reflection Loop

```
Impulsive transaction logged
  ▼
GET /api/coach/reflection → prompt based on impulsive count / patterns
  ▼
CoachBanner or ReflectionLogSheet appears
  │  user picks feeling + reason
  ▼
POST /api/coach/reflection → reflection saved
```

### Coach Check-In

```
Periodic check-in created (dueAt)
  ▼
GET /api/coach/check-in → CoachCheckInBanner on home
  │  user taps "Done" or "Skip"
  ▼
POST /api/coach/check-in/:id/complete or /dismiss
```

---

## 4. Roadmap

### P0 — Real Authentication

**Goal**: Replace dev `x-user-id` with production-ready auth so the app can serve real users.

**Scope**:
- OAuth login (Google and/or Apple) and optional email/password
- JWT issuance with refresh token rotation
- User onboarding flow: first login sets monthly budget + currency
- Frontend login/signup page (only non-sheet page besides home)
- Protect `x-user-id` fallback behind `NODE_ENV !== "production"` (already done in middleware)

**Key files**:
- `backend/src/middleware/auth.ts` — extend with token refresh, OAuth verification
- New `backend/src/routes/auth.ts` — `/api/auth/login`, `/api/auth/register`, `/api/auth/refresh`
- New frontend login page or sheet
- `frontend/src/lib/api.ts` — switch from `x-user-id` to `Authorization: Bearer` in production

---

### P1 — Goals System

**Goal**: Let users set savings goals and track progress, leveraging the existing `Goal` model.

**Scope**:
- CRUD API for goals: create, list, update progress, delete
- Frontend goal cards (home screen or dedicated sheet)
- Visual progress bars (reuse XP bar pattern)
- Optional: link a goal to a category (e.g., "save $500 by cutting dining out")

**Key files**:
- `backend/prisma/schema.prisma` — `Goal` model already exists (name, targetAmount, currentAmount, targetDate)
- New `backend/src/routes/goals.ts` + `backend/src/repositories/goal.ts`
- New frontend `GoalSheet` or `GoalCard` component

---

### P2 — Recurring Transactions

**Goal**: Track subscriptions and fixed bills so Safe to Spend accounts for committed spending.

**Scope**:
- New `RecurringTransaction` model: amount, frequency (daily/weekly/monthly/yearly), nextOccurrence, endDate, category, account, spendType
- On-demand materialization: when computing safe-to-spend, include projected recurring costs for the remainder of the month
- UI to create/edit/delete recurring items (subscriptions sheet)
- Display upcoming recurring charges on home screen or spendings list

**Key files**:
- `backend/prisma/schema.prisma` — new model + migration
- `backend/src/services/summary.ts` — adjust safe-to-spend formula to subtract projected recurring
- New `backend/src/routes/recurring.ts`
- New frontend `RecurringSheet` component

---

### P3 — Deeper AI Coach

**Goal**: Move beyond impulsive-count triggers to personalized, pattern-aware coaching.

**Scope**:
- Spending pattern analysis: detect category spikes, time-of-day patterns, day-of-week trends, consecutive impulsive streaks
- Context-rich prompts: "You've spent 40% more on food this week than last" instead of generic nudges
- Coach insights cards on home screen (dismissable, max 1-2 visible)
- Weekly digest: summary of spending behavior + one actionable suggestion
- Extend prompt context sent to OpenAI to include aggregated spending data (no raw transactions)

**Key files**:
- `backend/src/services/aiCoach.ts` — richer context building
- `backend/src/services/coach.ts` — pattern detection logic
- New `backend/src/services/patterns.ts` — reusable spending pattern analysis
- Frontend: new `CoachInsightCard` component

---

### P4 — Notifications, Reminders & Feeling Prompts

**Goal**: Proactively reach the user at the right moment — scheduled reminders to log spending, and pattern-triggered prompts to log feelings before/during impulsive behavior.

**Scope**:
- **Scheduled reminders**: user-configured daily/weekly nudges ("Log your spending!") via push notification or in-app banner
- **Pattern-triggered feeling prompts**: detect recurring spending patterns (e.g., late-night impulse buys, repeated category spikes on certain days) and proactively surface a feeling-log prompt — "We noticed you tend to spend impulsively on Friday nights. How are you feeling right now?"
- **Integration with coach system**: detected patterns feed into reflection prompts and coach insights (P3), creating a feedback loop between pattern detection → feeling log → personalized coaching
- **Notification preferences**: user controls channels (push, in-app), schedule, quiet hours

**Data model additions**:
- `NotificationPreference` — userId, channel, schedule (cron or simple), quietHoursStart/End, enabled
- `PatternAlert` — userId, patternType, triggerRule (JSON), lastFiredAt, cooldownMinutes

**Key files**:
- New `backend/src/services/patterns.ts` (shared with P3)
- New `backend/src/routes/notifications.ts` — `/api/notifications/preferences`
- Frontend: notification settings section in `SettingsSheet`, new `FeelingPromptSheet` component

---

### P5 — Spending Insights & Analytics

**Goal**: Give users clear visibility into where their money goes and how their behavior trends over time.

**Scope**:
- Category-level breakdown: pie or bar chart of spending by category for current month
- Time-series: daily/weekly/monthly spending trends
- Planned vs Impulsive ratio over time (weekly rolling)
- Comparison: this month vs last month
- Insights screen accessible from home navigation

**Key files**:
- New `backend/src/routes/insights.ts` + `backend/src/services/insights.ts`
- New `/api/summary/insights` endpoint (aggregations by category, period, spendType)
- New frontend `InsightsScreen` component (chart library TBD — lightweight, e.g., recharts or visx)

---

## 5. Technical Constraints

| Constraint | Detail |
|------------|--------|
| **Design source of truth** | [`DESIGN_AND_STACK.md`](DESIGN_AND_STACK.md) — locked-in vibe, theme, typography, and interaction patterns |
| **Navigation** | Single-page, sheet-based. No client-side router pages beyond `/`. Spendings uses a full-screen swap, not a route |
| **Backend ownership** | AI-maintained. PRD and code comments should provide enough context for an AI to implement any feature |
| **Accessibility** | `useReducedMotion` respected for all Framer Motion animations. System theme (light/dark) support via CSS variables |
| **Auth boundary** | All `/api/*` routes require auth. `/health` is public. Dev `x-user-id` header is non-production only |
| **AI coach resilience** | Coach prompts always fall back to hardcoded text when OpenAI is unavailable. 5-second timeout, no retries |
| **Safe to Spend formula** | `(monthlyBudget - spentThisMonth) / daysLeftInMonth`. Budget source: sum of budget lines, or `user.monthlyBudgetAmount` as fallback |

---

## 6. Non-Goals / Out of Scope

- **Social / accountability features** — no shared budgets, leaderboards, or friend systems
- **Native mobile apps** — web-first; PWA consideration is future but not on the roadmap
- **Multi-currency** — users set a single currency; no exchange-rate conversion
- **Bank integrations** — no Plaid, Open Banking, or automatic transaction imports
- **Offline mode** — requires network connectivity; no service worker or local-first architecture currently planned

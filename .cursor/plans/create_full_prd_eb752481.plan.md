---
name: Create Full PRD
overview: Create a comprehensive Product Requirements Document (PRD) for the ADHD Budget Tracker that covers the current product state, architecture, and a prioritized roadmap -- optimized as AI context for future development sessions.
todos:
  - id: write-prd
    content: "Write PRD.md at project root with all six sections: Product Overview, Current State, User Flows, Roadmap (Auth, Goals, Recurring, AI Coach, Notifications & Feeling Prompts, Insights), Technical Constraints, Non-Goals"
    status: completed
isProject: false
---

# Create PRD for ADHD Budget Tracker

## What

Create a single `PRD.md` file at the project root that serves as a complete Product Requirements Document. It will be structured for AI assistants to quickly understand the product, its architecture, current state, and what to build next.

## Document Structure

The PRD will contain these sections:

### 1. Product Overview

- Product name, one-liner, target user (people with ADHD managing finances)
- Core thesis: reduce decision fatigue, gamify discipline, use coaching to build awareness of impulsive spending
- Design philosophy summary (utilitarian, gamified, "Hype Man" tone, neon accents)

### 2. Current State (what's built)

- **Architecture**: Monorepo with `backend/` (Express + Prisma + Postgres) and `frontend/` (Next.js 15 App Router + Tailwind + Framer Motion)
- **Key features implemented**:
  - Safe to Spend Today (hero metric + XP bar)
  - Quick-add expense via pull-down gesture (Planned vs Impulsive classification)
  - Budget lines management
  - Transaction list with swipe-to-delete
  - Coach system: reflection prompts, check-ins, reminders, nudge banners
  - Settings (monthly budget, currency)
  - Docker Compose deployment
- **Data model**: User, Account, Category, Budget, Transaction (with SpendType), CoachPrompt, Reflection, CoachCheckIn, Goal (schema only)
- **API surface**: 15+ endpoints under `/api` (summary, quick expense, coach, accounts, categories, transactions, budgets, user settings)
- **Auth**: JWT + dev `x-user-id` header; no production auth flow yet
- **Frontend**: Single-page with sheet-based navigation (HomeScreen, QuickAddSheet, BudgetSheet, SettingsSheet, SpendingsScreen, ReflectionLogSheet)

### 3. User Flows (current)

Describe the primary user journeys already implemented:

- Home -> pull-down -> quick-add -> Planned/Impulsive -> done
- Home -> view spendings -> swipe to delete
- Home -> budget sheet -> manage budget lines
- Home -> settings -> set monthly budget
- Coach nudges / reflection prompts (passive, triggered by impulsive count)

### 4. Roadmap (prioritized)

Six features, in recommended build order:

**P0 -- Real Authentication**

- Replace dev `x-user-id` with proper auth (OAuth via Google/Apple, or email/password)
- JWT issuance and refresh tokens
- User onboarding flow (set monthly budget on first login)
- Files affected: `backend/src/middleware/auth.ts`, new `/api/auth/`* routes, frontend login page

**P1 -- Goals System**

- Expose the existing `Goal` model via API (CRUD endpoints)
- Frontend UI: goal cards on home screen, progress tracking
- Link goals to budget categories or savings targets
- Files: `backend/prisma/schema.prisma` (model exists), new `backend/src/routes/goals.ts`, new frontend component

**P2 -- Recurring Transactions**

- New `RecurringTransaction` model (amount, frequency, next occurrence, category, account)
- Background job or on-request generation of transactions from recurring templates
- UI to create/manage recurring items (subscriptions, bills)
- Auto-deduct from Safe to Spend calculation

**P3 -- Deeper AI Coach**

- Personalized spending pattern analysis (weekly/monthly trends)
- Context-aware reflection prompts based on category patterns, not just impulsive count
- "Coach insights" cards: "You spent 40% more on food this week"
- Extend `backend/src/services/aiCoach.ts` and `coach.ts`

**P4 -- Notifications, Reminders & Feeling Prompts**

- Push notifications / in-app reminders on a user-configured schedule (e.g. daily "log your spending" nudge)
- Pattern-triggered feeling prompts: detect recurring spending patterns (e.g. late-night impulse buys, repeated category spikes) and proactively ask the user to log how they're feeling
- Ties into the coach system -- detected patterns feed into reflection prompts and coach insights
- New `NotificationPreference` model (channels, schedule, quiet hours) and `PatternAlert` model (trigger rules, last fired)
- Backend: pattern detection logic in `backend/src/services/`, new `/api/notifications/preferences` endpoint
- Frontend: notification settings in SettingsSheet, in-app prompt banners/sheets for feeling logs

**P5 -- Spending Insights / Analytics**

- Category-level breakdowns (pie/bar charts)
- Time-series views (daily, weekly, monthly trends)
- Planned vs Impulsive ratio over time
- New frontend analytics screen, new `/api/summary/insights` endpoint

### 5. Technical Constraints

- Reference [DESIGN_AND_STACK.md](DESIGN_AND_STACK.md) for locked-in design and stack decisions
- Single-page sheet-based navigation pattern (no multi-page routing)
- All backend code is AI-maintained; PRD should provide enough context for AI to implement any feature
- Accessibility: `useReducedMotion` for animations, system theme support

### 6. Non-Goals / Out of Scope

- Social / accountability features
- Native mobile apps (web-first)
- Multi-currency support beyond user preference

## File Changes

- **Create**: `[PRD.md](PRD.md)` at project root (single new file, ~200-300 lines)
- No changes to existing code or documentation files


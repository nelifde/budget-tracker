# Design constraints & tech stack

This doc reflects your design specs. Backend is fully implemented by the AI; you only guide frontend design and UX.

---

## Design and UX constraints (locked in)

- **Vibe**: Utilitarian, distraction-free, heavily gamified.
- **Copy**: "Hype Man" — high energy, encouraging, never clinical.
- **Theme**: System default; full Light and Dark. Backgrounds: deep black (dark) / pure white (light). Accents: electric/neon (e.g. neon green for savings, cyber purple for challenges) used only for XP bar, rewards, and core actions.
- **Typography**: Tech/arcade; big, chunky, futuristic (e.g. Space Grotesk). Critical numbers are massive and dominant.
- **Home**: Primary = massive neon "Safe to Spend Today". Secondary = XP bar (budget health, drains as spent, warning when low). Coach loop = reflection prompts tied to impulsive tags.
- **Quick add**: Pull-down from home → numpad (amount) → one big question: "Planned or Impulsive?" → log. Optional details behind "Add Details".
- **No small + buttons**: Add expense via tactile pull-down, not a tiny FAB.

---

## Frontend tech stack (gestures & animations)

- **Framework**: Next.js (App Router), React 18.
- **Styling**: Tailwind CSS + CSS variables for light/dark and neon accents.
- **Fonts**: Space Grotesk via `next/font/google` (tech/arcade, chunky).
- **Gestures**: `@use-gesture/react` for the **pull-down** (drag on y-axis to reveal logging sheet). Alternative: Framer Motion `drag` constraints (vertical only) for the same effect.
- **Animations**: **Framer Motion** for: pull-down sheet, "flash" of the Planned/Impulsive question, XP bar fill/drain, and screen transitions. `useReducedMotion` respected for accessibility.
- **State**: React Query for server state; local state for sheet open/closed and quick-add step.
- **Theme**: `prefers-color-scheme` + CSS vars (e.g. `--bg-primary`, `--accent-green`, `--accent-purple`) so light/dark and neon accents stay consistent.

---

## Backend schema mapping to features

| Feature | Backing schema / logic |
|--------|-------------------------|
| **Safe to Spend Today** | `User.monthlyBudgetAmount`. Formula: `(monthlyBudgetAmount - spentThisMonth) / daysLeftInMonth` (min 0). If no monthly budget set, can fall back to "remaining this month" from sum of budgets or show a setup CTA. |
| **XP bar** | Same period. `remaining = monthlyBudgetAmount - spentThisMonth`; `xpPercent = (remaining / monthlyBudgetAmount) * 100`. Bar "drains" as spent; flash warning when below threshold (e.g. &lt; 20%). |
| **Planned vs Impulsive** | `Transaction.spendType` enum: `PLANNED` \| `IMPULSIVE`. Quick-add payload sends `spendType`; optional details (category, note) behind "Add Details". |
| **Coach loop** | Impulsive count from `Transaction` where `spendType = IMPULSIVE`. Reflection prompts keyed by rules (e.g. "3+ impulsive this week"). `CoachPrompt` stores `(userId, promptKey, shownAt)` to avoid repeating the same prompt too soon. |

---

## API surface (backend implements)

- `GET /api/summary/safe-to-spend` — Safe to Spend Today amount, XP bar percentage, remaining in period, spent today.
- `POST /api/quick/expense` — Body: `{ amount, spendType: "PLANNED"|"IMPULSIVE", accountId?, categoryId? }`. Defaults: last used account, today’s date. Optional details behind separate PATCH or optional fields.
- `GET /api/coach/reflection` — Returns one reflection prompt (or null) based on impulsive history and last-shown prompts.
- Plus existing CRUD: accounts, categories, budgets, transactions (with filters), goals.

All of the above are implemented in the backend; no backend code required from you.

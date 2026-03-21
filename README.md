# ADHD Budget Tracker

Utilitarian, gamified budget tracker: minimal decisions, pull-down to log, Safe to Spend Today + XP bar, Planned vs Impulsive tracking, and optional coach reflections.

- **Backend**: Express + TypeScript + Prisma (PostgreSQL). You don’t need to write backend code; the AI maintains it.
- **Frontend**: Next.js, Tailwind, Framer Motion, `@use-gesture/react`. You guide design and UX; see [DESIGN_AND_STACK.md](./DESIGN_AND_STACK.md) for constraints and tech stack.

## Quick start

### Backend

```bash
cd backend
cp .env.example .env   # set DATABASE_URL and optionally JWT_SECRET
npm install
npx prisma migrate dev
npx prisma generate
npm run dev
```

Dev auth: send `x-user-id: <cuid>` (and create a User in DB) or use a real JWT.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local   # optional; default API is http://localhost:4000
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (default for `next dev`). Ensure the backend is running (default [http://localhost:4000](http://localhost:4000)); override with `NEXT_PUBLIC_API_URL` in `frontend/.env.local` if needed. Pull down on the home screen to open the quick-add sheet (amount → Planned or Impulsive).

## Design specs

Stored in [DESIGN_AND_STACK.md](./DESIGN_AND_STACK.md). Summary:

- **Vibe**: Utilitarian, distraction-free, gamified. Copy = “Hype Man”.
- **Theme**: System light/dark. Deep black / pure white backgrounds. Neon accents (green, purple) for XP bar and actions only.
- **Typography**: Space Grotesk, massive numbers for Safe to Spend Today.
- **Flow**: Home shows Safe to Spend Today + XP bar; pull-down opens logging; one question: Planned or Impulsive; optional details behind “Add Details”.

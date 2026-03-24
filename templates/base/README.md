# My SaaS

Scaffolded with [shipindays](https://github.com/nikhilsaiankilla/shipindays) — a CLI that wires up auth, email, and payments so you can focus on building.

---

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS + shadcn/ui |
| Auth | ← replaced by your chosen provider |
| Email | ← replaced by your chosen provider |
| Database | Your choice |
| Deployment | Vercel |

---

## Getting started

**1. Install dependencies**

```bash
npm install
```

**2. Set up environment variables**

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in every value. Each variable has a comment telling you where to get it.

**3. Push your database schema**

```bash
npm run db:push
```

**4. Start the dev server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project structure

```
src/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx        ← login page
│   ├── (marketing)/
│   │   └── page.tsx              ← homepage
│   ├── dashboard/
│   │   └── page.tsx              ← protected dashboard
│   └── api/
│       └── auth/                 ← auth API routes
│           ├── google/           ← starts Google OAuth
│           ├── magic/            ← sends magic link (Supabase only)
│           ├── callback/         ← OAuth callback handler
│           └── complete/         ← new vs existing user check
├── components/
│   ├── auth/
│   │   └── logout-button.tsx
│   └── branding/
│       └── powered-by-shipindays.tsx
├── lib/
│   ├── auth/index.ts             ← getCurrentUser, requireUser, signOut
│   └── email/index.ts            ← sendWelcomeEmail, sendPasswordResetEmail
└── proxy.ts                  ← protects /dashboard routes
```

---

## Auth

Three functions — that's the entire auth API your app uses:

```ts
import { getCurrentUser, requireUser, signOut } from "@/lib/auth";

// Returns user or null — use for conditional UI
const user = await getCurrentUser();

// Returns user or redirects to /login — use on protected pages
const user = await requireUser();

// Signs out + redirects to /
await signOut();
```

The middleware at `src/middleware.ts` automatically protects `/dashboard` and redirects unauthenticated users to `/login`.

### New vs existing user

After OAuth or magic link login, the user lands at `/api/auth/complete`. This is where you decide where to send them:

```ts
// src/app/api/auth/complete/route.ts

// Check DB — existing user → /dashboard, new user → /onboarding
const existing = await db.select()...

if (!existing) {
  await db.insert(users).values({ ... });
  return NextResponse.redirect(`${appUrl}/onboarding`);
}

return NextResponse.redirect(`${appUrl}/dashboard`);
```

---

## Email

```ts
import { sendWelcomeEmail, sendPasswordResetEmail } from "@/lib/email";

await sendWelcomeEmail({ to: "user@example.com", name: "John" });
await sendPasswordResetEmail({ to: "user@example.com", resetUrl: "https://..." });
```

To add a new email type — add the function to `src/lib/email/index.ts` and call it wherever needed.

---

## Adding new routes

**Public route** — just create the file:

```
src/app/about/page.tsx  →  /about
```

**Protected route** — update the middleware matcher:

```ts
// src/middleware.ts
const isProtected =
  pathname.startsWith("/dashboard") ||
  pathname.startsWith("/settings");    // ← add your path here
```

---

## Deployment

**Vercel (recommended)**

```bash
npm i -g vercel
vercel
```

Add all your `.env.local` variables to Vercel → Project → Settings → Environment Variables.

**Other platforms**

Standard Next.js — deploys to Railway, Render, Fly.io, AWS, or anywhere Next.js runs.

---

## Scripts

```bash
npm run dev           # start dev server at localhost:3000
npm run build         # production build
npm run start         # start production server
npm run lint          # run ESLint
npm run db:push       # push schema to database (Drizzle)
npm run db:generate   # generate migrations
npm run db:studio     # open Drizzle Studio (database GUI)
```

---

## Built with shipindays

Scaffolded with [shipindays](https://github.com/nikhilsaiankilla/shipindays). If it saved you time, a ⭐ on GitHub helps the project reach more developers.
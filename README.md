# ⚡ shipindays

> Scaffold a production-ready Next.js SaaS in seconds. Pick your stack, get auth + email wired up and working.

```bash
npx @shipindays/shipindays@latest my-app
```

[![npm version](https://img.shields.io/npm/v/create-shipindays)](https://www.npmjs.com/package/@shipindays/shipindays)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/nikhilsaiankilla/shipindays)](https://github.com/nikhilsaiankilla/shipindays)

---

## What is this?

Most SaaS boilerplates give you one fixed stack. You either use it or you don't.

`create-shipindays` asks you what you want and builds it for you:

```
? Auth provider
  ❯ Supabase Auth
    NextAuth v5

? Email provider
  ❯ Resend
    Nodemailer

✓ Auth: supabase injected.
✓ Email: resend injected.
✓ Your SaaS is scaffolded.
```

Every combination produces a working Next.js 15 app with the right files, the right dependencies, and a pre-filled `.env.example`.

---

## What's included

Every scaffold includes:

- **Next.js 15** with App Router and TypeScript
- **Tailwind CSS** + **shadcn/ui** components
- Auth — your choice of provider
- Email — your choice of provider
- Protected `/dashboard` route
- Login + Signup pages
- `.env.example` pre-filled for your chosen stack
- `.gitignore` that won't leak your secrets

---

## Quick start

```bash
# Create a new project
npx @shipindays/shipindays@latest my-app

# Move into it
cd my-app

# Copy env file and fill in your keys
cp .env.example .env.local

# Push database schema (if using Drizzle)
npm run db:push

# Start dev server
npm run dev
```

---

## Supported providers

| Feature | Providers |
|---------|-----------|
| Auth    | Supabase Auth, NextAuth v5 |
| Email   | Resend, Nodemailer |

More coming. PRs welcome — see [Contributing](#contributing).

---

## Support

If `create-shipindays` saved you time, consider supporting the project.

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-donate-yellow)](https://buymeacoffee.com/nikhilsaiankilla)
[![Ko-fi](https://img.shields.io/badge/Ko--fi-donate-blue)](https://ko-fi.com/nikhilsaiankilla)

## Hiring

I build full stack products and open source tooling. If your team is looking for a developer, let's talk.

→ [x.com/itzznikhilsai](https://x.com/itzznikhilsai)
→ [nikhilsaiankilla@gmail.com](mailto:nikhilsaiankilla@gmail.com)

---

## How it works

The CLI is built on a **base + blocks** pattern.

### Base template

`templates/base/` is always copied first. It contains:

- The full Next.js app skeleton
- **Placeholder files** for auth and email that throw errors if called
- App code that imports from fixed paths (`@/lib/auth`, `@/lib/email`) — these paths never change

### Blocks

`templates/blocks/<feature>/<provider>/` contains the real implementation for each provider.

When you pick a provider, the CLI copies that block's files **on top of the base**. Because both the base placeholder and the block use the same file paths, the block overwrites the placeholder.

```
base/src/lib/auth/index.ts        ← placeholder (throws error)
                  ↑
blocks/auth/supabase/src/lib/auth/index.ts  ← real Supabase implementation
                  ↑
                copies and overwrites
                  ↓
your-project/src/lib/auth/index.ts  ← Supabase code, ready to use
```

Your app always imports `from "@/lib/auth"`. It never knows or cares which provider is underneath.

---

## Project structure

```
create-shipindays/
├── index.js                         ← CLI entry point (the npx command)
├── package.json                     ← CLI's own dependencies
│
└── templates/
    ├── base/                        ← always scaffolded first
    │   └── src/
    │       ├── middleware.ts        ← placeholder
    │       ├── lib/
    │       │   ├── auth/index.ts    ← placeholder
    │       │   └── email/index.ts   ← placeholder
    │       └── app/
    │           ├── dashboard/page.tsx
    │           └── (auth)/
    │               ├── login/page.tsx
    │               └── signup/page.tsx
    │
    └── blocks/
        ├── auth/
        │   ├── supabase/            ← injected when user picks Supabase Auth
        │   │   ├── package.json
        │   │   └── src/
        │   │       ├── middleware.ts
        │   │       ├── lib/auth/index.ts
        │   │       └── lib/supabase/
        │   │           ├── server.ts
        │   │           └── client.ts
        │   │
        │   └── nextauth/            ← injected when user picks NextAuth v5
        │       ├── package.json
        │       └── src/
        │           ├── middleware.ts
        │           ├── lib/auth/index.ts
        │           └── app/api/auth/
        │               └── [...nextauth]/
        │                   └── route.ts   ← ONLY nextauth has this
        │
        └── email/
            ├── resend/
            │   ├── package.json
            │   └── index.ts
            └── nodemailer/
                ├── package.json
                └── index.ts
```

---

## Contributing

PRs are very welcome. The most valuable contributions are **new provider blocks**.

### Setup

```bash
git clone https://github.com/nikhilsaiankilla/shipindays
cd shipindays
npm install
npm link          # makes "create-shipindays" available as a local command
```

Test your changes:

```bash
create-shipindays test-app
cd test-app
cat src/lib/auth/index.ts    # verify the right block was injected
cat .env.example             # verify the right env vars were added
```

---

## How to add a new provider block

There are two cases depending on whether your provider needs files at **paths that already exist in base**, or needs **extra files that base doesn't have**.

---

### CASE 1 — Provider only needs files that already exist in base

**Example: adding Postmark as an email provider.**

Postmark only needs `src/lib/email/index.ts` — a file that already exists in base as a placeholder. This is the simple case.

**Step 1 — Create the block folder**

```
templates/blocks/email/postmark/
```

**Step 2 — Add `index.ts` with the exact same exported functions as other email providers**

```ts
// templates/blocks/email/postmark/index.ts

export async function sendWelcomeEmail({ to, name }: { to: string; name: string }) {
  // your Postmark implementation
}

export async function sendPasswordResetEmail({ to, resetUrl }: { to: string; resetUrl: string }) {
  // your Postmark implementation
}
```

> ⚠️ **The exported function names must be identical to every other email block.**
> The rest of the app calls these functions by name. If the name is different, it breaks.

**Step 3 — Add `package.json` with only this provider's dependencies**

```json
{
  "dependencies": {
    "postmark": "^4.0.0"
  }
}
```

**Step 4 — Register it in `index.js`**

Add to `EMAIL_PROVIDERS`:

```js
postmark: {
  label: "Postmark",
  hint:  "postmarkapp.com — great deliverability",
},
```

Add to `ENV_VARS.email`:

```js
postmark: {
  "# ── Postmark (Email) ──────────────────────────────────────────────────": [
    "POSTMARK_API_TOKEN=",
  ],
},
```

**That's it.** The CLI will show Postmark as an option and inject it correctly.

---

### CASE 2 — Provider needs extra files that base doesn't have

**Example 1: NextAuth needs `src/app/api/auth/[...nextauth]/route.ts`**
**Example 2: Supabase needs `src/lib/supabase/server.ts` and `src/lib/supabase/client.ts`**

Base doesn't have these files at all. The block needs to add them from scratch.

This is handled automatically — the `injectBlock()` function for `auth` blocks copies the **entire `src/` folder** of the block into the project's `src/` folder. So any extra files your block includes just get created.

**Step 1 — Create the block folder with a `src/` subfolder**

```
templates/blocks/auth/myauth/
  src/                          ← must be named src/
    lib/
      auth/
        index.ts                ← replaces base placeholder (required)
    middleware.ts               ← replaces base placeholder (required)
```

**Step 2 — Add any extra files your provider needs inside `src/`**

For example, if your provider needs a server client and browser client:

```
templates/blocks/auth/myauth/
  src/
    lib/
      auth/
        index.ts                ← replaces base placeholder
      myauth/
        server.ts               ← EXTRA file — doesn't exist in base, gets created
        client.ts               ← EXTRA file — doesn't exist in base, gets created
    middleware.ts               ← replaces base placeholder
```

For example, if your provider needs an API route:

```
templates/blocks/auth/myauth/
  src/
    lib/
      auth/
        index.ts
    middleware.ts
    app/
      api/
        auth/
          [...myauth]/
            route.ts            ← EXTRA file — gets created in the project
```

**Step 3 — The contract: `lib/auth/index.ts` must export these exact 3 functions**

No matter what else your block does internally, `src/lib/auth/index.ts` must export:

```ts
// Every auth block MUST export these 3 functions with these exact signatures.
// The dashboard, middleware, and login page call these — they never change.

export async function getCurrentUser(): Promise<User | null>
// Returns the logged-in user, or null if not logged in.
// Used when you want to show different UI for logged-in vs logged-out users.

export async function requireUser(): Promise<User>
// Returns the logged-in user, or redirects to /login if not logged in.
// Used on any page that requires authentication.

export async function signOut(): Promise<void>
// Signs the user out and redirects to /.
// Called from logout buttons.
```

**Step 4 — Add `package.json` with only this provider's dependencies**

```json
{
  "dependencies": {
    "my-auth-package": "^1.0.0"
  }
}
```

**Step 5 — Register it in `index.js`**

Add to `AUTH_PROVIDERS`:

```js
myauth: {
  label: "MyAuth",
  hint:  "Description of your provider",
},
```

Add to `ENV_VARS.auth`:

```js
myauth: {
  "# ── MyAuth ───────────────────────────────────────────────────────────────": [
    "MYAUTH_API_KEY=",
    "MYAUTH_SECRET=",
  ],
},
```

**That's it.** The CLI handles everything else — injecting the files, merging deps, writing env vars.

---

## How `injectBlock()` works internally

This is the function that makes the whole system work. Understanding it helps you debug issues.

```
EMAIL blocks:
  Copies block files → project/src/lib/<feature>/
  e.g. blocks/email/resend/index.ts → project/src/lib/email/index.ts

AUTH blocks:
  Copies block's src/ folder → project/src/
  e.g. blocks/auth/nextauth/src/middleware.ts → project/src/middleware.ts
       blocks/auth/nextauth/src/lib/auth/index.ts → project/src/lib/auth/index.ts
       blocks/auth/nextauth/src/app/api/auth/[...nextauth]/route.ts → project/src/app/api/auth/[...nextauth]/route.ts
```

`overwrite: true` is set on every copy. This means:
- Files that exist in base get overwritten by the block (placeholder → real implementation)
- Files that don't exist in base get created fresh (extra files like API routes)

---

## The contract system

Every feature has a contract — a set of functions that **every provider for that feature must export**.

The rest of the app only ever calls contract functions. It never imports from the provider directly.

### Auth contract

```ts
// src/lib/auth/index.ts — every auth block must export these
export async function getCurrentUser(): Promise<User | null>
export async function requireUser(): Promise<User>
export async function signOut(): Promise<void>
```

### Email contract

```ts
// src/lib/email/index.ts — every email block must export these
export async function sendWelcomeEmail(args: { to: string; name: string }): Promise<void>
export async function sendPasswordResetEmail(args: { to: string; resetUrl: string }): Promise<void>
```

If you add a new email type (e.g. `sendInvoiceEmail`), add it to the base placeholder first, then implement it in every existing email block, then in your new block.

---

## Adding a completely new feature (e.g. payments)

Follow this checklist:

```
1. Create block folders:
   templates/blocks/payments/stripe/
   templates/blocks/payments/lemonsqueezy/

2. Add placeholder to base:
   templates/base/src/lib/payments/index.ts
   (same pattern — exports functions that throw errors)

3. Implement the contract in each block:
   blocks/payments/stripe/index.ts
   blocks/payments/lemonsqueezy/index.ts
   (each must export the same function names)

4. Add package.json to each block with its deps

5. In index.js:
   a. Add PAYMENT_PROVIDERS object (same shape as EMAIL_PROVIDERS)
   b. Add ENV_VARS.payments object (same shape as ENV_VARS.email)
   c. Add a p.select() prompt in main() for payments
   d. Add choices.payments = paymentsProvider to the choices object
   e. Add injectBlock("payments", choices.payments, targetPath) call
   f. Add mergePackageJson(targetPath, "payments", choices.payments) call
```

---

## FAQ

**Q: Why not just have separate full templates like `create-t3-app`?**

Full templates mean if you have 3 auth providers × 3 email providers × 2 payment providers, you need 18 separate templates. Any bug fix needs to be made 18 times. Blocks mean you fix it once.

**Q: What if two blocks conflict?**

They shouldn't if they respect the contract. Both blocks write to `src/lib/auth/index.ts` but only one is ever injected per project. They never coexist.

**Q: What if I want to add a provider that needs to modify an existing file (not just replace it)?**

This is the one case blocks don't handle cleanly. For example, if you needed to add a line to `layout.tsx`. For now, document it as a manual step in the block's README. Code generation (writing files programmatically) is planned for v2.

---

## Roadmap

- [ ] Payments — Stripe block
- [ ] Payments — Lemon Squeezy block
- [ ] Auth — Clerk block
- [ ] Database — Drizzle + Supabase Postgres block
- [ ] Database — Mongoose + MongoDB block
- [ ] Code generation for layout-level injections

---

## License

MIT — free forever.

---

## Author

Built by [Nikhil Sai](https://x.com/itzznikhilsai).

If this helped you ship faster, a ⭐ on GitHub goes a long way.
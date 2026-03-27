#!/usr/bin/env node

/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║                    SHIP IN DAYS - CLI CORE                      ║
 * ║                                                                  ║
 * ║  Architecture: Base + Block system                               ║
 * ║  1. The Base template is copied first (common UI/Config).        ║
 * ║  2. Feature Blocks (Auth, DB, etc.) are merged on top.           ║
 * ║  3. Dependencies are merged into a final package.json.           ║
 * ║                                                                  ║
 * ║  DEFAULT STACK (pre-selected):                                   ║
 * ║    Database  → Drizzle ORM + Supabase PostgreSQL                 ║
 * ║    Auth      → Supabase Auth                                     ║
 * ║    Email     → Resend                                            ║
 * ║    Payments  → Dodo Payments                                     ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * ──────────────────────────────────────────────────────────────────
 * HOW TO ADD A NEW PROVIDER (e.g. a new payment gateway "LemonSqueezy")
 * ──────────────────────────────────────────────────────────────────
 *
 * STEP 1 — Add it to the provider map (e.g. PAYMENT_PROVIDERS below).
 *           Each entry needs: { label, hint, url }
 *
 *   lemonsqueezy: {
 *     label: "Lemon Squeezy",
 *     hint:  "Merchant of Record — great for digital products",
 *     url:   "https://lemonsqueezy.com",
 *   },
 *
 * STEP 2 — Add its required .env variables to ENV_VARS under the
 *           correct feature key (e.g. ENV_VARS.payments.lemonsqueezy).
 *
 *   lemonsqueezy: {
 *     "# Lemon Squeezy (app.lemonsqueezy.com → Settings → API)": [
 *       "LEMONSQUEEZY_API_KEY=",
 *       "LEMONSQUEEZY_WEBHOOK_SECRET=",
 *       "NEXT_PUBLIC_LEMONSQUEEZY_STORE_ID=",
 *     ],
 *   },
 *
 * STEP 3 — Create the block folder at:
 *           templates/blocks/payments/lemonsqueezy/
 *           Inside it, add the files you want injected into the user's
 *           project (e.g. src/lib/lemonsqueezy.ts) and a package.json
 *           with any extra dependencies.
 *
 * STEP 4 — If the folder name on disk doesn't match the key you used
 *           in PAYMENT_PROVIDERS, add a mapping in BLOCK_FOLDER_MAP:
 *
 *   payments: {
 *     ...existing entries...
 *     lemonsqueezy: "lemonsqueezy",   // key → folder name
 *   },
 *
 * That's it. The CLI will automatically pick it up on the next run.
 */

import * as p from "@clack/prompts";
import chalk from "chalk";
import fs from "fs-extra";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import figlet from "figlet";
import gradient from "gradient-string";

// Path resolution (ESM doesn't expose __dirname globally)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = path.join(__dirname, "templates");
const BASE_DIR = path.join(TEMPLATES_DIR, "base");
const BLOCKS_DIR = path.join(TEMPLATES_DIR, "blocks");

// STEP 1 ─ PROVIDER DEFINITIONS
//
// Each provider object must have:
//   label  — shown in the selection list
//   hint   — shown as a subtitle/description in the list
//   url    — shown next to the label so users know where to sign up
//
// The KEY (e.g. "drizzle", "supabase") is used internally to:
//   • look up ENV_VARS
//   • resolve the block folder via BLOCK_FOLDER_MAP
//   • write "choices" that get passed through the whole pipeline
//
// To skip a feature entirely, users can select the "none" option which
// is injected automatically — you don't need to add it here.

/** Database ORM + connection providers */
const DATABASE_PROVIDERS = {
  // Add new database providers below this line
  drizzle: {
    label: "Drizzle ORM + Supabase PostgreSQL",
    hint: "Lightweight SQL-first ORM using Supabase Postgres",
    url: "supabase.com",
  },
  // prisma: {
  //   label: "Prisma ORM + PostgreSQL",
  //   hint: "Type-safe ORM with migrations & powerful client",
  //   url: "prisma.io",
  // },
  // Add new database providers above this line
};

/** Authentication providers */
const AUTH_PROVIDERS = {
  // Add new auth providers below this line
  supabase: {
    label: "Supabase Auth",
    hint: "Magic link + OAuth — server.ts + client.ts included",
    url: "supabase.com",
  },
  // nextauth: {
  //   label: "NextAuth v5",
  //   hint: "Credentials + Google + GitHub — self-hostable",
  //   url: "authjs.dev",
  // },
  // Add new auth providers above this line
};

/** Transactional email providers */
const EMAIL_PROVIDERS = {
  // Add new email providers below this line
  resend: {
    label: "Resend",
    hint: "resend.com — best DX, generous free tier",
    url: "resend.com",
  },
  mailgun: {
    label: "Mailgun",
    hint: "mailgun.com — powerful API, great for scaling",
    url: "mailgun.com",
  },
  // Add new email providers above this line
};

/** Payment providers */
const PAYMENT_PROVIDERS = {
  // Add new payment providers below this line
  dodopayments: {
    label: "Dodo Payments",
    hint: "Merchant of Record — simplifies global tax/compliance",
    url: "dodopayments.com",
  },
  polar: {
    label: "Polar",
    hint: "Merchant of Record handling global payments, tax, and compliance",
    url: "polar.sh",
  },
  // stripe: {
  //   label: "Stripe",
  //   hint: "Subscriptions + One-time payments via Stripe Checkout",
  //   url: "stripe.com",
  // },
  // Add new payment providers above this line
};

// STEP 2 ─ DEFAULT STACK
//
// These values are pre-selected when the user starts the CLI.
// They match the keys in the provider maps above.
// Change them here to update the defaults globally.
const DEFAULTS = {
  database: "drizzle",
  auth: "supabase",
  email: "resend",
  payments: "dodopayments",
};

// STEP 3 ─ ENVIRONMENT VARIABLES
//
// Every provider must declare its required .env keys here.
// These are written to .env.example so users know what to fill in.
//
// Structure:
//   ENV_VARS.<feature>.<providerKey> = { "# comment": ["VAR=", ...], ... }
//
// The "none" provider never needs an entry here — it's handled automatically.
const ENV_VARS = {
  /** Base vars always included regardless of provider choices */
  base: {
    "# App": ["NEXT_PUBLIC_APP_URL=http://localhost:3000"],
  },

  database: {
    // Add env vars for new database providers below
    drizzle: {
      "# Supabase database url! go to supabase → connect → transaction pooler": [
        "DATABASE_URL=",
      ],
    },
    // prisma: {
    //   "# PostgreSQL connection (Supabase or any provider)": [
    //     "DATABASE_URL=",
    //   ],
    // },
    // Add env vars for new database providers above
  },

  auth: {
    // Add env vars for new auth providers below
    supabase: {
      "# Supabase (supabase.com → project → settings → API)": [
        "NEXT_PUBLIC_SUPABASE_URL=",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY=",
        "SUPABASE_SERVICE_ROLE_KEY=",
      ],
    },
    // nextauth: {
    //   "# NextAuth": [
    //     "# openssl rand -base64 32",
    //     "AUTH_SECRET="
    //   ],
    //   "# OAuth — Google (console.cloud.google.com)": [
    //     "AUTH_GOOGLE_ID=",
    //     "AUTH_GOOGLE_SECRET=",
    //   ],
    // },
    // Add env vars for new auth providers above
  },

  email: {
    // Add env vars for new email providers below
    resend: {
      "# Resend (resend.com → API Keys)": [
        "RESEND_API_KEY=",
      ],
    },
    mailgun: {
      "# Mailgun (mailgun.com → Sending → Domains)": [
        "MAILGUN_API_KEY=",
        "MAILGUN_DOMAIN=",
      ],
    },
    // Add env vars for new email providers above
  },

  payments: {
    // Add env vars for new payment providers below
    dodopayments: {
      "# Dodo Payments (app.dodopayments.com → Developers → API Keys)": [
        "DODO_PAYMENTS_API_KEY=",
        "DODO_PAYMENTS_WEBHOOK_KEY=",
        "DODO_ENV=test"
      ],
      "# Dodo Pricing": [
        "NEXT_PUBLIC_DODO_PRICE_ID_STARTER=",
        "NEXT_PUBLIC_DODO_PRICE_ID_PRO=",
      ],
    },
    polar: {
      "# Polar Payments": [
        "POLAR_ACCESS_TOKEN=",
        "POLAR_PAYMENTS_WEBHOOK_KEY=",
      ],
      "# Dodo Pricing": [
        "NEXT_PUBLIC_POLAR_PRICE_ID_STARTER=",
        "NEXT_PUBLIC_POLAR_PRICE_ID_PRO=",
      ],
    },
    // stripe: {
    //   "# Stripe (dashboard.stripe.com → Developers → API keys)": [
    //     "STRIPE_SECRET_KEY=",
    //     "STRIPE_WEBHOOK_SECRET=",
    //     "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=",
    //   ],
    //   "# Stripe Pricing": [
    //     "NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER=",
    //     "NEXT_PUBLIC_STRIPE_PRICE_ID_PRO=",
    //   ],
    // },
    // Add env vars for new payment providers above
  },
};

// STEP 4 ─ BLOCK FOLDER MAP
//
// Maps provider keys → actual folder names inside templates/blocks/<feature>/.
//
// You only need an entry here if the folder name differs from the key.
// E.g. key "drizzle" → folder "drizzle-supabase" needs a mapping.
//
// If the key and folder name are identical (e.g. key "stripe" → folder "stripe")
// you can omit it and the fallback will use the key directly.
const BLOCK_FOLDER_MAP = {
  database: {
    // Add folder name overrides for new database providers below
    drizzle: "drizzle-supabase",
    // prisma: "prisma-supabase",
    // Add folder name overrides for new database providers above
  },
  auth: {
    // Add folder name overrides for new auth providers below
    // (none needed currently — key matches folder)
    // Add folder name overrides for new auth providers above
  },
  email: {
    // Add folder name overrides for new email providers below
    // (none needed currently)
    // Add folder name overrides for new email providers above
  },
  payments: {
    // Add folder name overrides for new payment providers below
    // (none needed currently — key matches folder)
    // Add folder name overrides for new payment providers above
  },
};

// FILES / DIRS TO NEVER COPY from block folders
const IGNORE_LIST = [
  "package.json",   // merged separately via mergePackageJson
  "node_modules",   // should never exist in a block, but guard anyway
  ".next",          // Next.js build cache
  ".turbo",         // Turborepo cache
  ".DS_Store",      // macOS junk
  "Thumbs.db",      // Windows junk
  "README.md",      // Block-level docs, not for users
  ".env",           // Never copy secrets
  ".env.local",
  "dist",           // Compiled output
  ".git",           // Sub-repos
];

// UTILITY: Build select options from a provider map
//
// Injects a "none" option at the end so users can skip optional features.
// The "none" value is a sentinel — injectBlock and ENV_VARS both check for it
// and do nothing when selected.
function buildOptions(providerMap) {
  const opts = Object.entries(providerMap).map(([value, { label, hint, url }]) => ({
    value,
    label: `${label}  ${chalk.dim(url)}`,
    hint,
  }));

  // "none" option — skips this feature entirely
  opts.push({
    value: "none",
    label: chalk.dim("None  (skip this feature)"),
    hint: "No files or env vars will be added for this feature",
  });

  return opts;
}

// CORE ENGINE: Recursive directory merge
//
// Merges src into dest WITHOUT deleting existing files.
// Only adds new files or overwrites individual files — never blows away folders.
//
// skipNames is propagated at every recursion level so ignored files/folders
// are consistently excluded no matter how deep they sit.
async function copyDir(src, dest, skipNames = []) {
  await fs.ensureDir(dest);

  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    if (skipNames.includes(entry.name)) continue;

    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      // Recurse — do NOT use fs.copy() here because it replaces the whole
      // target directory, deleting any files the base already put there.
      await copyDir(srcPath, destPath, skipNames);
    } else {
      await fs.copy(srcPath, destPath, { overwrite: true });
    }
  }
}

// BLOCK INJECTION
//
// Copies all files from templates/blocks/<feature>/<folderName>/ into the
// user's project, excluding IGNORE_LIST entries at every level.
//
// "none" is a no-op — returns immediately without copying anything.
async function injectBlock(feature, provider, targetPath) {
  // "none" means the user explicitly skipped this feature
  if (!provider || provider === "none") return;

  // Resolve actual folder name (may differ from provider key)
  const folderName = BLOCK_FOLDER_MAP[feature]?.[provider] ?? provider;
  const blockRoot = path.join(BLOCKS_DIR, feature, folderName);

  if (!(await fs.pathExists(blockRoot))) {
    throw new Error(
      `Block folder not found: ${blockRoot}\n` +
      `Make sure templates/blocks/${feature}/${folderName}/ exists.`
    );
  }

  // Debug: log what the block folder contains
  const blockEntries = await fs.readdir(blockRoot, { withFileTypes: true });
  const visibleEntries = blockEntries
    .filter(e => !IGNORE_LIST.includes(e.name))
    .map(e => e.name);

  if (visibleEntries.length === 0) {
    console.warn(chalk.yellow(`  ⚠  Block ${feature}/${folderName} has no files to inject.`));
    return;
  }

  for (const entry of blockEntries) {
    if (IGNORE_LIST.includes(entry.name)) continue;

    const srcPath = path.join(blockRoot, entry.name);
    const destPath = path.join(targetPath, entry.name);

    if (entry.isDirectory()) {
      // Use copyDir (recursive merge) — NOT fs.copy — so we never
      // destroy files that the base or an earlier block already put here.
      await copyDir(srcPath, destPath, IGNORE_LIST);
    } else {
      await fs.copy(srcPath, destPath, { overwrite: true });
    }
  }
}

// PACKAGE.JSON MERGER
//
// Deep-merges dependencies, devDependencies, and scripts from a block's
// package.json into the target project's package.json.
//
// Script merge rule: block scripts overwrite or add to base scripts.
// This is how commands like `db:push` and `auth:setup` reach the user's project.
//
// "none" is a no-op.
async function mergePackageJson(targetPath, feature, provider) {
  if (!provider || provider === "none") return;

  const folderName = BLOCK_FOLDER_MAP[feature]?.[provider] ?? provider;
  const blockPkgPath = path.join(BLOCKS_DIR, feature, folderName, "package.json");
  const targetPkgPath = path.join(targetPath, "package.json");

  if (!(await fs.pathExists(blockPkgPath)) || !(await fs.pathExists(targetPkgPath))) return;

  const targetPkg = await fs.readJson(targetPkgPath);
  const blockPkg = await fs.readJson(blockPkgPath);

  targetPkg.dependencies = { ...(targetPkg.dependencies ?? {}), ...(blockPkg.dependencies ?? {}) };
  targetPkg.devDependencies = { ...(targetPkg.devDependencies ?? {}), ...(blockPkg.devDependencies ?? {}) };
  targetPkg.scripts = { ...(targetPkg.scripts ?? {}), ...(blockPkg.scripts ?? {}) };

  await fs.writeJson(targetPkgPath, targetPkg, { spaces: 2 });
}

// MAIN CLI FLOW
async function main() {
  printBanner();
  p.intro(chalk.bgGreen(chalk.black(" shipindays ")));

  // 1. Project directory
  let projectDir = process.argv[2];

  if (!projectDir) {
    const answer = await p.text({
      message: "Where should we create your project?",
      placeholder: "./my-saas",
      defaultValue: "./my-saas",
      validate(val) {
        const clean = val.replace(/^\.\//, "");
        if (clean !== "." && !isValidName(clean)) {
          return "Letters, numbers, hyphens, underscores only.";
        }
      },
    });
    if (p.isCancel(answer)) { p.cancel("Cancelled."); process.exit(0); }
    projectDir = answer;
  }

  const isCurrentDir = projectDir === "." || projectDir === "./";
  const targetPath = isCurrentDir
    ? process.cwd()
    : path.resolve(process.cwd(), projectDir.replace(/^\.\//, ""));
  const projectName = isCurrentDir
    ? path.basename(process.cwd())
    : toSlug(path.basename(projectDir.replace(/^\.\//, "")));

  if (!isCurrentDir && await fs.pathExists(targetPath)) {
    const files = (await fs.readdir(targetPath)).filter(f => f !== ".git");
    if (files.length > 0) {
      const ok = await p.confirm({
        message: `${projectDir} is not empty. Overwrite?`,
        initialValue: false,
      });
      if (p.isCancel(ok) || !ok) { p.cancel("Cancelled."); process.exit(0); }
    }
  }

  // 2. Stack mode default or custom
  //
  // First ask whether to use the recommended default stack or pick manually.
  // If "default" is chosen we skip all four provider prompts entirely and
  // jump straight to git/install. If "custom" is chosen we show each prompt
  // with the default pre-selected so users can change only what they want.

  const stackMode = await p.select({
    message: "How do you want to set up your stack?",
    options: [
      {
        value: "default",
        label: chalk.green("Use the recommended stack") + "  " + chalk.dim("(fastest)"),
        hint: `Drizzle + Supabase Auth + Resend + Dodo Payments`,
      },
      {
        value: "custom",
        label: "I'll choose my own providers",
        hint: "Pick database, auth, email, and payments individually",
      },
    ],
    initialValue: "default",
  });
  if (p.isCancel(stackMode)) { p.cancel("Cancelled."); process.exit(0); }

  let choices;

  if (stackMode === "default") {
    // Use defaults as-is, no further prompts needed
    choices = { ...DEFAULTS };

  } else {
    // Custom: show each provider prompt with default pre-selected
    //
    // The "none" option (appended by buildOptions) lets users skip any
    // feature. initialValue still points at the recommended default so
    // users only need to move the cursor when they want something different.
    console.log("\n" + chalk.dim("  Choose your providers — defaults are pre-selected.\n"));

    // Database
    const dbProvider = await p.select({
      message: "Database & ORM",
      options: buildOptions(DATABASE_PROVIDERS),
      initialValue: DEFAULTS.database,
    });
    if (p.isCancel(dbProvider)) { p.cancel("Cancelled."); process.exit(0); }

    // Auth
    const authProvider = await p.select({
      message: "Authentication",
      options: buildOptions(AUTH_PROVIDERS),
      initialValue: DEFAULTS.auth,
    });
    if (p.isCancel(authProvider)) { p.cancel("Cancelled."); process.exit(0); }

    // Email
    const emailProvider = await p.select({
      message: "Email",
      options: buildOptions(EMAIL_PROVIDERS),
      initialValue: DEFAULTS.email,
    });
    if (p.isCancel(emailProvider)) { p.cancel("Cancelled."); process.exit(0); }

    // Payments
    const paymentProvider = await p.select({
      message: "Payments",
      options: buildOptions(PAYMENT_PROVIDERS),
      initialValue: DEFAULTS.payments,
    });
    if (p.isCancel(paymentProvider)) { p.cancel("Cancelled."); process.exit(0); }

    choices = {
      database: dbProvider,
      auth: authProvider,
      email: emailProvider,
      payments: paymentProvider,
    };
  }

  // Print a summary of what the user picked
  printChoicesSummary(choices);

  // 3. Git + install preferences
  const initGit = await p.confirm({
    message: "Initialize a git repository?",
    initialValue: true,
  });
  if (p.isCancel(initGit)) { p.cancel("Cancelled."); process.exit(0); }

  const pm = detectPM();
  const install = await p.confirm({
    message: `Install dependencies with ${pm}?`,
    initialValue: true,
  });
  if (p.isCancel(install)) { p.cancel("Cancelled."); process.exit(0); }

  const spin = p.spinner();

  // 4. Copy base template
  spin.start("Copying base template...");
  await copyDir(BASE_DIR, targetPath, ["node_modules", ".next", ".turbo"]);
  spin.stop("Base template copied.");

  // 5. Inject feature blocks
  //
  // Features are injected in this order: database → auth → email → payments.
  // Later blocks can safely overwrite files from earlier blocks if needed.
  // "none" selections are silently skipped inside injectBlock / mergePackageJson.

  const FEATURES = ["database", "auth", "email", "payments"];

  for (const feature of FEATURES) {
    const selection = choices[feature];

    // "none" = user opted out of this feature
    if (!selection || selection === "none") {
      p.log.info(`${feature} skipped.`);
      continue;
    }

    const folderName = BLOCK_FOLDER_MAP[feature]?.[selection] ?? selection;
    spin.start(`Injecting ${feature}: ${folderName}...`);

    await injectBlock(feature, selection, targetPath);
    await mergePackageJson(targetPath, feature, selection);

    spin.stop(`${feature} (${folderName}) injected ✓`);
  }

  // 6. Write .env.example 
  spin.start("Writing .env.example...");
  await fs.outputFile(path.join(targetPath, ".env.example"), buildEnvExample(choices));
  spin.stop(".env.example written.");

  // 7. Write .gitignore
  await fs.outputFile(path.join(targetPath, ".gitignore"), buildGitignore());

  // 8. Set project name in package.json 
  spin.start("Configuring package.json...");
  const pkgPath = path.join(targetPath, "package.json");
  if (await fs.pathExists(pkgPath)) {
    const pkg = await fs.readJson(pkgPath);
    pkg.name = projectName;
    await fs.writeJson(pkgPath, pkg, { spaces: 2 });
  }
  spin.stop("package.json configured.");

  // 9. Git init
  if (initGit) {
    spin.start("Initialising git...");
    try {
      run("git init", targetPath);
      run("git add -A", targetPath);
      run(`git commit -m "chore: scaffold from shipindays"`, targetPath);
      spin.stop("Git initialised.");
    } catch {
      spin.stop(chalk.yellow("Git skipped — please run manually."));
    }
  }

  // 10. Install dependencies
  if (install) {
    spin.start(`Installing with ${pm}...`);
    try {
      const cmd =
        pm === "yarn" ? "yarn" :
          pm === "pnpm" ? "pnpm install" :
            "npm install";
      run(cmd, targetPath);
      spin.stop("Dependencies installed.");
    } catch {
      spin.stop(chalk.yellow(`Run '${pm} install' manually.`));
    }
  }

  p.outro(chalk.green("Done!"));
  printNextSteps(projectDir, pm, choices);
}

// PRINT HELPERS
function printBanner() {
  const bannerText = figlet.textSync("Ship In Days", { font: "Slant" });
  console.log("\n");
  console.log(gradient(["#FF8C00", "#8A2BE2"])(bannerText));
  console.log(chalk.dim("  Ship your SaaS in days, not months."));
  console.log(chalk.dim("  https://shipindays.nikhilsai.in\n"));
}

/**
 * Prints a human-readable summary of the stack the user chose,
 * including the provider website URL and whether a feature was skipped.
 */
function printChoicesSummary(choices) {
  const ALL_PROVIDERS = {
    database: DATABASE_PROVIDERS,
    auth: AUTH_PROVIDERS,
    email: EMAIL_PROVIDERS,
    payments: PAYMENT_PROVIDERS,
  };

  console.log("\n" + chalk.bold("  Your stack:"));
  console.log(chalk.dim("  ─────────────────────────────────────────────"));

  for (const [feature, selection] of Object.entries(choices)) {
    const featureLabel = feature.padEnd(10);

    if (!selection || selection === "none") {
      console.log(`  ${chalk.dim(featureLabel)}  ${chalk.dim("skipped")}`);
      continue;
    }

    const providerMeta = ALL_PROVIDERS[feature]?.[selection];
    const label = providerMeta?.label ?? selection;
    const url = providerMeta?.url ? chalk.dim(`  (${providerMeta.url})`) : "";

    // Show a "default" badge if the selection matches the recommended default
    const isDefault = selection === DEFAULTS[feature];
    const badge = isDefault ? chalk.bgGreen(chalk.black(" default ")) + " " : "";

    console.log(`  ${chalk.cyan(featureLabel)}  ${badge}${label}${url}`);
  }

  console.log(chalk.dim("  ─────────────────────────────────────────────\n"));
}

// .ENV.EXAMPLE BUILDER
//
// Writes all base vars first, then each chosen provider's vars.
// "none" selections are silently skipped.
function buildEnvExample(choices) {
  let out = [
    "# shipindays — environment variables",
    "# 1. cp .env.example .env.local",
    "# 2. Fill in every blank value before running npm run dev",
    "",
  ].join("\n");

  // Base vars (always included)
  for (const [comment, vars] of Object.entries(ENV_VARS.base)) {
    out += `${comment}\n${vars.join("\n")}\n\n`;
  }

  // Feature vars (only for selected providers)
  for (const [feature, selection] of Object.entries(choices)) {
    if (!selection || selection === "none") continue;

    const providerVars = ENV_VARS[feature]?.[selection];
    if (!providerVars) continue;

    for (const [comment, vars] of Object.entries(providerVars)) {
      out += `${comment}\n${vars.join("\n")}\n\n`;
    }
  }

  return out.trimEnd() + "\n";
}

// .GITIGNORE BUILDER
function buildGitignore() {
  return [
    "# dependencies",
    "node_modules/",
    ".pnp",
    ".pnp.js",
    "",
    "# Next.js",
    ".next/",
    "out/",
    "build/",
    "",
    "# env — never commit these",
    ".env",
    ".env.local",
    ".env.*.local",
    "",
    "# misc",
    ".DS_Store",
    "*.pem",
    "npm-debug.log*",
    "yarn-debug.log*",
    "yarn-error.log*",
    "",
    "# drizzle",
    "drizzle/",
    "",
    "# Vercel",
    ".vercel",
  ].join("\n");
}

// NEXT STEPS OUTPUT
function printNextSteps(projectDir, pm, choices) {
  const isHere = projectDir === "." || projectDir === "./";
  const runCmd = pm === "npm" ? "npm run" : pm;
  let n = 1;
  const s = (cmd) => console.log(chalk.dim(`  ${n++}. ${cmd}`));

  console.log("\n");
  console.log(chalk.green("  ✓ Your SaaS is scaffolded.\n"));

  // Show chosen providers
  if (choices.database && choices.database !== "none")
    console.log(chalk.dim(`  Database  → ${DATABASE_PROVIDERS[choices.database]?.label ?? choices.database}`));
  if (choices.auth && choices.auth !== "none")
    console.log(chalk.dim(`  Auth      → ${AUTH_PROVIDERS[choices.auth]?.label ?? choices.auth}`));
  if (choices.email && choices.email !== "none")
    console.log(chalk.dim(`  Email     → ${EMAIL_PROVIDERS[choices.email]?.label ?? choices.email}`));
  if (choices.payments && choices.payments !== "none")
    console.log(chalk.dim(`  Payments  → ${PAYMENT_PROVIDERS[choices.payments]?.label ?? choices.payments}`));

  console.log("");
  if (!isHere) s(`cd ${projectDir.replace(/^\.\//, "")}`);
  s("cp .env.example .env.local");
  s("  → Fill in your keys (see comments in .env.local)");

  // Only show db:push if a database was selected
  if (choices.database && choices.database !== "none") {
    s(`${runCmd} db:push`);
  }

  s(`${runCmd} dev`);
  console.log("");
  console.log(chalk.dim("  Please give a star to the repo! Thanks"));
  console.log(chalk.dim("  GitHub  → https://github.com/nikhilsaiankilla/shipindays"));
  console.log(chalk.dim("  Twitter → https://x.com/itzznikhilsai"));
  console.log("");
  console.log(chalk.green("  Now go build what only you can build.\n"));
}

// SMALL UTILITIES
function isValidName(n) { return /^[a-zA-Z0-9-_]+$/.test(n); }
function toSlug(s) { return s.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-_]/g, ""); }
function detectPM() { const a = process.env.npm_config_user_agent ?? ""; return a.includes("pnpm") ? "pnpm" : a.includes("yarn") ? "yarn" : "npm"; }
function run(cmd, cwd) { execSync(cmd, { cwd, stdio: "inherit" }); }

// ENTRY POINT
main().catch((err) => {
  console.error(chalk.red("\n  Fatal: " + err.message));
  process.exit(1);
});
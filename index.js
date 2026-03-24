#!/usr/bin/env node

import * as p from "@clack/prompts";
import chalk from "chalk";
import fs from "fs-extra";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import figlet from "figlet";
import gradient from "gradient-string";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const TEMPLATES_DIR = path.join(__dirname, "templates");
const BASE_DIR = path.join(TEMPLATES_DIR, "base");
const BLOCKS_DIR = path.join(TEMPLATES_DIR, "blocks");

function printBanner() {
  const bannerText = figlet.textSync("Ship In Days", {
    font: "Slant",
  });

  console.log("\n");

  // This creates a smooth transition from Orange to Purple
  console.log(gradient(["#FF8C00", "#8A2BE2"])(bannerText));
  console.log(chalk.dim("  Ship your SaaS in days, not months."));
  console.log(chalk.dim("  https://shipindays.nikhilsai.in\n"));
}

const AUTH_PROVIDERS = {
  supabase: {
    label: "Supabase Auth",
    hint: "Magic link + OAuth — server.ts + client.ts included",
  },
  nextauth: {
    label: "NextAuth v5",
    hint: "Credentials + Google + GitHub — self-hostable",
  },
};

const EMAIL_PROVIDERS = {
  resend: {
    label: "Resend",
    hint: "resend.com — best DX, generous free tier",
  },
  mailgun: {
    label: "Mailgun",
    hint: "mailgun.com — powerful API, great for scaling",
  },
};

// Add to your CLI constants
const PAYMENT_PROVIDERS = {
  stripe: {
    label: "Stripe",
    hint: "Subscriptions + One-time payments via Stripe Checkout",
  },
  dodopayments: {
    label: "Dodo Payments",
    hint: "Merchant of Record — simplifies global tax/compliance",
  },
};

// DATABASE providers constants
const DATABASE_PROVIDERS = {
  drizzle: {
    label: "Drizzle ORM + Supabase PostgreSQL",
    hint: "Lightweight SQL-first ORM using Supabase Postgres",
  },
  prisma: {
    label: "Prisma ORM + PostgreSQL",
    hint: "Type-safe ORM with migrations & powerful client",
  },
};

const ENV_VARS = {
  base: {
    "# App": ["NEXT_PUBLIC_APP_URL=http://localhost:3000"],
  },

  // 1. Move database to the top level (Fixes the missing Drizzle envs)
  database: {
    drizzle: {
      "# Supabase database url! go to supabase -> connect -> transaction pooler": [
        "DATABASE_URL=",
      ],
    },  

    prisma: {
      "# PostgreSQL connection (Supabase or any provider)": [
        "DATABASE_URL=",
      ],
    },
  },

  auth: {
    supabase: {
      "# Supabase (supabase.com → project → settings → API)": [
        "NEXT_PUBLIC_SUPABASE_URL=",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY=",
        "SUPABASE_SERVICE_ROLE_KEY=",
      ],
    },
    nextauth: {
      "# NextAuth": ["AUTH_SECRET=", "NEXTAUTH_URL=http://localhost:3000"],
      "# OAuth — Google (console.cloud.google.com)": [
        "AUTH_GOOGLE_ID=",
        "AUTH_GOOGLE_SECRET=",
      ],
    },
  },

  email: {
    resend: {
      "# Resend (resend.com → API Keys)": ["RESEND_API_KEY="],
    },
    mailgun: {
      "# Mailgun (mailgun.com → Sending → Domains)": [
        "MAILGUN_API_KEY=",
        "MAILGUN_DOMAIN=",
      ],
    },
  },

  // 2. Move payments to the top level (Fixes the missing Dodo envs)
  payments: {
    stripe: {
      "# Stripe (dashboard.stripe.com → Developers → API keys)": [
        "STRIPE_SECRET_KEY=",
        "STRIPE_WEBHOOK_SECRET=",
        "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=",
      ],
      "# Stripe Pricing": [
        "NEXT_PUBLIC_STRIPE_PRICE_ID_BASIC=",
        "NEXT_PUBLIC_STRIPE_PRICE_ID_PRO=",
      ],
    },
    dodopayments: {
      "# Dodo Payments (app.dodopayments.com → Developers → API Keys)": [
        "DODO_PAYMENTS_API_KEY=",
        "DODO_PAYMENTS_WEBHOOK_KEY=",
      ],
      "# Dodo Pricing": [
        "NEXT_PUBLIC_DODO_PRICE_ID_BASIC=",
        "NEXT_PUBLIC_DODO_PRICE_ID_PRO=",
      ],
    },
  },
};

// block mapping
// variable name : folder name 
const DATABASE_BLOCK_MAP = {
  drizzle: "drizzle-supabase",
  prisma: "prisma-supabase",
};

/**
 * RECURSIVE DIRECTORY MERGE
 * * This function walks through the source directory and copies files to the destination.
 * If a directory exists in both places, it dives deeper to merge contents rather 
 * than replacing the entire folder.
 */
async function copyDir(src, dest, skipNames = []) {
  await fs.ensureDir(dest);
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    if (skipNames.includes(entry.name)) continue;

    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      // If it's a directory, recurse into it to ensure we don't 
      // overwrite existing folders in the target, but merge into them.
      await copyDir(srcPath, destPath, skipNames);
    } else {
      // If it's a file, copy/overwrite it into the target.
      await fs.copy(srcPath, destPath, { overwrite: true });
    }
  }
}

/**
 * BLOCK INJECTION LOGIC
 * * Improved to handle deep nesting. It takes everything inside the provider folder 
 * (except package.json and node_modules) and merges it into the project root.
 */
async function injectBlock(feature, provider, targetPath) {
  const blockRoot = path.join(BLOCKS_DIR, feature, provider);

  if (!await fs.pathExists(blockRoot)) {
    throw new Error(`Block folder missing: ${blockRoot}`);
  }

  const blockEntries = await fs.readdir(blockRoot, { withFileTypes: true });

  for (const entry of blockEntries) {
    // 1. Skip package.json (handled by mergePackageJson)
    // 2. Skip node_modules or .next if they exist in the template
    if (
      entry.name === "package.json" ||
      entry.name === "node_modules" ||
      entry.name === ".next"
    ) continue;

    const srcPath = path.join(blockRoot, entry.name);
    const destPath = path.join(targetPath, entry.name);

    if (entry.isDirectory()) {
      // This will now correctly merge 'src', 'public', 'hooks', etc.
      // because copyDir is recursive.
      await copyDir(srcPath, destPath, ["node_modules", ".next"]);
    } else {
      await fs.copy(srcPath, destPath, { overwrite: true });
    }
  }
}

/**
 * PACKAGE.JSON MERGER
 * * Deep merges dependencies and devDependencies so the final project
 * has all required libraries from every selected block.
 */
async function mergePackageJson(targetPath, feature, provider) {
  const blockPkgPath = path.join(BLOCKS_DIR, feature, provider, "package.json");
  const targetPkgPath = path.join(targetPath, "package.json");

  if (!await fs.pathExists(blockPkgPath) || !await fs.pathExists(targetPkgPath)) return;

  const targetPkg = await fs.readJson(targetPkgPath);
  const blockPkg = await fs.readJson(blockPkgPath);

  targetPkg.dependencies = { ...(targetPkg.dependencies ?? {}), ...(blockPkg.dependencies ?? {}) };
  targetPkg.devDependencies = { ...(targetPkg.devDependencies ?? {}), ...(blockPkg.devDependencies ?? {}) };

  await fs.writeJson(targetPkgPath, targetPkg, { spaces: 2 });
}

function buildEnvExample(choices) {
  let out = [
    "# shipindays — environment variables",
    "# 1. cp .env.example .env.local",
    "# 2. Fill in every blank value before running npm run dev",
    "",
  ].join("\n");

  for (const [comment, vars] of Object.entries(ENV_VARS.base)) {
    out += `${comment}\n${vars.join("\n")}\n\n`;
  }

  for (const [feature, provider] of Object.entries(choices)) {
    const providerVars = ENV_VARS[feature]?.[provider];
    if (!providerVars) continue;
    for (const [comment, vars] of Object.entries(providerVars)) {
      out += `${comment}\n${vars.join("\n")}\n\n`;
    }
  }

  return out.trimEnd() + "\n";
}

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

function isValidName(n) { return /^[a-zA-Z0-9-_]+$/.test(n); }

function toSlug(s) {
  return s.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-_]/g, "");
}

function detectPM() {
  const a = process.env.npm_config_user_agent ?? "";
  return a.includes("pnpm") ? "pnpm" : a.includes("yarn") ? "yarn" : "npm";
}

function run(cmd, cwd) { execSync(cmd, { cwd, stdio: "inherit" }); }

function printNextSteps(projectDir, pm, choices) {
  const isHere = projectDir === "." || projectDir === "./";
  const runCmd = pm === "npm" ? "npm run" : pm;
  let n = 1;
  const s = (cmd) => console.log(chalk.dim(`  ${n++}. ${cmd}`));

  console.log("\n");
  console.log(chalk.green("  ✓ Your SaaS is scaffolded.\n"));
  console.log(chalk.dim(`  Auth  → ${choices.auth}`));
  console.log(chalk.dim(`  Email → ${choices.email}`));
  console.log("");
  if (!isHere) s(`cd ${projectDir.replace(/^\.\//, "")}`);
  s("cp .env.example .env.local");
  s("  → Fill in your keys (see comments in .env.local)");
  s(`${runCmd} db:push`);
  s(`${runCmd} dev`);
  console.log("");
  console.log(chalk.dim("  Please give a star to the repo! Thanks"));
  console.log(chalk.dim("  GitHub  → https://github.com/nikhilsaiankilla/shipindays"));
  console.log(chalk.dim("  Twitter → https://x.com/itzznikhilsai"));
  console.log("");
  console.log(chalk.green("  Now go build what only you can build.\n"));
}

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

  // pick database provider
  const dbProvider = await p.select({
    message: "Database Provider",
    options: Object.entries(DATABASE_PROVIDERS).map(([value, { label, hint }]) => ({
      value, label, hint,
    })),
  })
  if (p.isCancel(dbProvider)) { p.cancel("Cancelled."); process.exit(0); }

  // Pick auth provider
  const authProvider = await p.select({
    message: "Auth provider",
    options: Object.entries(AUTH_PROVIDERS).map(([value, { label, hint }]) => ({
      value, label, hint,
    })),
  });
  if (p.isCancel(authProvider)) { p.cancel("Cancelled."); process.exit(0); }

  // 3. Pick email provider
  const emailProvider = await p.select({
    message: "Email provider",
    options: Object.entries(EMAIL_PROVIDERS).map(([value, { label, hint }]) => ({
      value, label, hint,
    })),
  });
  if (p.isCancel(emailProvider)) { p.cancel("Cancelled."); process.exit(0); }

  const paymentProvider = await p.select({
    message: "Payment provider",
    options: Object.entries(PAYMENT_PROVIDERS).map(([value, { label, hint }]) => ({
      value, label, hint,
    })),
  });

  const choices = {
    database: dbProvider,
    auth: authProvider,
    email: emailProvider,
    payments: paymentProvider
  };

  // 4. Git + install preferences
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

  // 5. Copy base template
  spin.start("Copying base template...");
  await copyDir(BASE_DIR, targetPath, ["node_modules", ".next", ".turbo"]);
  spin.stop("Base template copied.");

  // 6. Inject Blocks
  // The injectBlock function now handles the internal recursion correctly.
  const features = ["database", "auth", "email", "payments"];
  
  for (const feature of features) {
    let provider = choices[feature];
    if (!provider) continue;
  
    // map database providers to actual folder names
    if (feature === "database") {
      provider = DATABASE_BLOCK_MAP[provider];
    }
  
    spin.start(`Injecting ${feature}: ${provider}...`);
    await injectBlock(feature, provider, targetPath);
    await mergePackageJson(targetPath, feature, provider);
    spin.stop(`${feature} injected ✓`);
  }

  // 8. Write .env.example
  spin.start("Writing .env.example...");
  await fs.outputFile(path.join(targetPath, ".env.example"), buildEnvExample(choices));
  spin.stop(".env.example written.");

  // 9. Write .gitignore
  await fs.outputFile(path.join(targetPath, ".gitignore"), buildGitignore());

  // 10. Set project name in package.json
  spin.start("Configuring package.json...");
  const pkgPath = path.join(targetPath, "package.json");
  if (await fs.pathExists(pkgPath)) {
    const pkg = await fs.readJson(pkgPath);
    pkg.name = projectName;
    await fs.writeJson(pkgPath, pkg, { spaces: 2 });
  }
  spin.stop("package.json configured.");

  // 11. Git init
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

  // 12. Install dependencies
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

main().catch((err) => {
  console.error(chalk.red("\n  Fatal: " + err.message));
  process.exit(1);
});
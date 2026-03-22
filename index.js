#!/usr/bin/env node

// FILE: index.js
// ROLE: CLI entry point
// RUNS: npx @shipindays/shipindays <project-name>
// ─────────────────────────────────────────────────────────────────────────────

import * as p from "@clack/prompts";
import chalk from "chalk";
import fs from "fs-extra";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const TEMPLATES_DIR = path.join(__dirname, "templates");
const BASE_DIR = path.join(TEMPLATES_DIR, "base");
const BLOCKS_DIR = path.join(TEMPLATES_DIR, "blocks");

function printBanner() {
  console.log("\n");
  console.log(chalk.green("  shipindays testing"));
  console.log(chalk.dim("  Ship your SaaS in days, not months."));
  console.log(chalk.dim("  https://shipindays.nikhilsai.com\n"));
}

// ─────────────────────────────────────────────────────────────────────────────
// BLOCK REGISTRY
//
// HOW TO ADD A NEW PROVIDER (e.g. Postmark for email):
//   1. Create folder:  templates/blocks/email/postmark/src/lib/email/index.ts
//   2. Match the exact same exported function names as other email providers
//   3. Add package.json at templates/blocks/email/postmark/package.json
//   4. Add entry to EMAIL_PROVIDERS below
//   5. Add env vars to ENV_VARS.email below
//
// HOW TO ADD A NEW FEATURE (e.g. payments):
//   1. Create folders:  templates/blocks/payments/stripe/src/lib/payments/index.ts
//   2. Add a PAYMENT_PROVIDERS object below (same shape)
//   3. Add a p.select() prompt in main()
//   4. Add injectBlock + mergePackageJson calls in the scaffold section
//   5. Add env vars to ENV_VARS below
// ─────────────────────────────────────────────────────────────────────────────

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
  nodemailer: {
    label: "Nodemailer",
    hint: "SMTP — works with Gmail, Outlook, any mail server",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// ENV VARS
// Add a new key here whenever you add a new provider.
// ─────────────────────────────────────────────────────────────────────────────

const ENV_VARS = {
  base: {
    "# App": ["NEXT_PUBLIC_APP_URL=http://localhost:3000"],
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
      "# OAuth — GitHub (github.com → Settings → Developer settings → OAuth Apps)":
        ["AUTH_GITHUB_ID=", "AUTH_GITHUB_SECRET="],
    },
  },

  email: {
    resend: {
      "# Resend (resend.com → API Keys)": ["RESEND_API_KEY="],
    },
    nodemailer: {
      "# SMTP / Nodemailer": [
        "SMTP_HOST=smtp.gmail.com",
        "SMTP_PORT=587",
        "SMTP_SECURE=false",
        "SMTP_USER=",
        "SMTP_PASS=",
        "SMTP_FROM=you@yourdomain.com",
      ],
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// BLOCK INJECTOR
//
// EVERY block must follow this structure — no exceptions:
//
//   templates/blocks/<feature>/<provider>/
//     package.json        ← extra deps only (read by mergePackageJson, NOT copied)
//     src/                ← everything inside here gets copied into project/src/
//       lib/
//         <feature>/
//           index.ts      ← replaces base placeholder at same path
//       ...any other files the provider needs (middleware, api routes, etc.)
//
// HOW COPYING WORKS:
//   block/src/ is copied ON TOP of project/src/
//   overwrite: true → files at matching paths replace base placeholders
//   new files (e.g. [...nextauth]/route.ts) get created since they don't exist in base
//
// EXAMPLE — Supabase block:
//   block/src/lib/auth/index.ts         → project/src/lib/auth/index.ts      (overwrites placeholder)
//   block/src/lib/supabase/server.ts    → project/src/lib/supabase/server.ts (new file)
//   block/src/lib/supabase/client.ts    → project/src/lib/supabase/client.ts (new file)
//   block/src/middleware.ts             → project/src/middleware.ts           (overwrites placeholder)
//   block/src/app/api/auth/login/...    → project/src/app/api/auth/login/...  (new file)
//
// EXAMPLE — NextAuth block (has one extra file Supabase doesn't):
//   block/src/lib/auth/index.ts                      → project/src/lib/auth/index.ts
//   block/src/middleware.ts                          → project/src/middleware.ts
//   block/src/app/layout.tsx                         → project/src/app/layout.tsx  (overwrites base layout)
//   block/src/app/api/auth/[...nextauth]/route.ts    → project/src/app/api/auth/[...nextauth]/route.ts (NEW — only nextauth)
//   block/src/types/next-auth.d.ts                   → project/src/types/next-auth.d.ts (NEW)
// ─────────────────────────────────────────────────────────────────────────────
async function injectBlock(feature, provider, targetPath) {
  const blockRoot = path.join(BLOCKS_DIR, feature, provider);
  const blockSrcDir = path.join(blockRoot, "src");

  // Check block folder exists
  if (!(await fs.pathExists(blockRoot))) {
    throw new Error(
      `Block not found: ${blockRoot}\n` +
        `Make sure templates/blocks/${feature}/${provider}/ exists.`,
    );
  }

  // Check src/ folder exists inside block
  if (!(await fs.pathExists(blockSrcDir))) {
    throw new Error(
      `Block src/ folder missing: ${blockSrcDir}\n` +
        `Every block must have a src/ folder.\n` +
        `Structure: templates/blocks/${feature}/${provider}/src/...`,
    );
  }

  // Copy entire block src/ into project src/
  // - Files matching base paths → overwrite placeholders
  // - New files → created fresh in the project
  await fs.copy(blockSrcDir, path.join(targetPath, "src"), {
    overwrite: true,
    filter: (src) => !src.includes("node_modules") && !src.includes(".next"),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// PACKAGE.JSON MERGER
//
// Reads block/package.json and merges its deps into project/package.json.
// This is separate from injectBlock so the block's package.json is never
// copied as a file into the project — it's only read for merging.
// ─────────────────────────────────────────────────────────────────────────────
async function mergePackageJson(targetPath, feature, provider) {
  const blockPkgPath = path.join(BLOCKS_DIR, feature, provider, "package.json");
  const targetPkgPath = path.join(targetPath, "package.json");

  if (!(await fs.pathExists(blockPkgPath))) return;
  if (!(await fs.pathExists(targetPkgPath))) return;

  const targetPkg = await fs.readJson(targetPkgPath);
  const blockPkg = await fs.readJson(blockPkgPath);

  targetPkg.dependencies = {
    ...(targetPkg.dependencies ?? {}),
    ...(blockPkg.dependencies ?? {}),
  };
  targetPkg.devDependencies = {
    ...(targetPkg.devDependencies ?? {}),
    ...(blockPkg.devDependencies ?? {}),
  };

  await fs.writeJson(targetPkgPath, targetPkg, { spaces: 2 });
}

// ─────────────────────────────────────────────────────────────────────────────
// ENV FILE BUILDER
// ─────────────────────────────────────────────────────────────────────────────
function buildEnvExample(choices) {
  let out = [
    "# ─────────────────────────────────────────────────────────────────────────",
    "# shipindays — environment variables",
    "# 1. cp .env.example .env.local",
    "# 2. Fill in every blank value before running npm run dev",
    "# ─────────────────────────────────────────────────────────────────────────",
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

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function isValidName(n) {
  return /^[a-zA-Z0-9-_]+$/.test(n);
}

function toSlug(s) {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "");
}

function detectPM() {
  const a = process.env.npm_config_user_agent ?? "";
  return a.includes("pnpm") ? "pnpm" : a.includes("yarn") ? "yarn" : "npm";
}

function run(cmd, cwd) {
  execSync(cmd, { cwd, stdio: "inherit" });
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
  console.log(
    chalk.dim("  GitHub  → https://github.com/nikhilsaiankilla/shipindays"),
  );
  console.log(chalk.dim("  Twitter → https://x.com/itzznikhilsai"));
  console.log("");
  console.log(chalk.green("  ⚡ Now go build what only you can build.\n"));
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  printBanner();
  p.intro(chalk.bgGreen(chalk.black(" shipindays ")));

  // ── 1. Project directory ───────────────────────────────────────────────────
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
    if (p.isCancel(answer)) {
      p.cancel("Cancelled.");
      process.exit(0);
    }
    projectDir = answer;
  }

  const isCurrentDir = projectDir === "." || projectDir === "./";
  const targetPath = isCurrentDir
    ? process.cwd()
    : path.resolve(process.cwd(), projectDir.replace(/^\.\//, ""));
  const projectName = isCurrentDir
    ? path.basename(process.cwd())
    : toSlug(path.basename(projectDir.replace(/^\.\//, "")));

  if (!isCurrentDir && (await fs.pathExists(targetPath))) {
    const files = (await fs.readdir(targetPath)).filter((f) => f !== ".git");
    if (files.length > 0) {
      const ok = await p.confirm({
        message: `${projectDir} is not empty. Overwrite?`,
        initialValue: false,
      });
      if (p.isCancel(ok) || !ok) {
        p.cancel("Cancelled.");
        process.exit(0);
      }
    }
  }

  // ── 2. Pick auth provider ──────────────────────────────────────────────────
  const authProvider = await p.select({
    message: "Auth provider",
    options: Object.entries(AUTH_PROVIDERS).map(([value, { label, hint }]) => ({
      value,
      label,
      hint,
    })),
  });
  if (p.isCancel(authProvider)) {
    p.cancel("Cancelled.");
    process.exit(0);
  }

  // ── 3. Pick email provider ─────────────────────────────────────────────────
  const emailProvider = await p.select({
    message: "Email provider",
    options: Object.entries(EMAIL_PROVIDERS).map(
      ([value, { label, hint }]) => ({
        value,
        label,
        hint,
      }),
    ),
  });
  if (p.isCancel(emailProvider)) {
    p.cancel("Cancelled.");
    process.exit(0);
  }

  const choices = {
    auth: authProvider,
    email: emailProvider,
  };

  const pm = detectPM();
  const install = await p.confirm({
    message: `Install dependencies with ${pm}?`,
    initialValue: true,
  });
  if (p.isCancel(install)) {
    p.cancel("Cancelled.");
    process.exit(0);
  }

  const spin = p.spinner();

  // ── 5. Copy base template ──────────────────────────────────────────────────
  spin.start("Copying base template...");
  if (!(await fs.pathExists(BASE_DIR))) {
    spin.stop(chalk.red(`Base template not found: ${BASE_DIR}`));
    process.exit(1);
  }
  await fs.copy(BASE_DIR, targetPath, {
    overwrite: true,
    filter: (src) =>
      !src.includes("node_modules") &&
      !src.includes(".next") &&
      !src.includes(".turbo"),
  });
  spin.stop("Base template copied.");

  // ── 6. Inject auth block ───────────────────────────────────────────────────
  spin.start(`Injecting auth: ${choices.auth}...`);
  await injectBlock("auth", choices.auth, targetPath);
  await mergePackageJson(targetPath, "auth", choices.auth);
  spin.stop(`Auth: ${choices.auth} ✓`);

  // ── 7. Inject email block ──────────────────────────────────────────────────
  spin.start(`Injecting email: ${choices.email}...`);
  await injectBlock("email", choices.email, targetPath);
  await mergePackageJson(targetPath, "email", choices.email);
  spin.stop(`Email: ${choices.email} ✓`);

  // ── FUTURE: payments ───────────────────────────────────────────────────────
  // spin.start(`Injecting payments: ${choices.payments}...`);
  // await injectBlock("payments", choices.payments, targetPath);
  // await mergePackageJson(targetPath, "payments", choices.payments);
  // spin.stop(`Payments: ${choices.payments} ✓`);

  // ── 8. Write .env.example ──────────────────────────────────────────────────
  spin.start("Writing .env.example...");
  await fs.outputFile(
    path.join(targetPath, ".env.example"),
    buildEnvExample(choices),
  );
  spin.stop(".env.example written.");

  // ── 9. Write .gitignore ────────────────────────────────────────────────────
  await fs.outputFile(path.join(targetPath, ".gitignore"), buildGitignore());

  // ── 10. Update package.json name ──────────────────────────────────────────
  spin.start("Configuring package.json...");
  const pkgPath = path.join(targetPath, "package.json");
  if (await fs.pathExists(pkgPath)) {
    const pkg = await fs.readJson(pkgPath);
    pkg.name = projectName;
    await fs.writeJson(pkgPath, pkg, { spaces: 2 });
  }
  spin.stop("package.json configured.");

  // ── 12. Install dependencies ───────────────────────────────────────────────
  if (install) {
    spin.start(`Installing with ${pm}...`);
    try {
      const cmd =
        pm === "yarn" ? "yarn" : pm === "pnpm" ? "pnpm install" : "npm install";
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

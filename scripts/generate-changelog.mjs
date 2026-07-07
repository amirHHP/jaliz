#!/usr/bin/env node

/**
 * Generates public/changelog.json from git history.
 * Run: node scripts/generate-changelog.mjs
 *
 * Output format:
 * [{ hash, shortHash, date, message, type, scope }]
 */

import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// Load Farsi translations cache (shortHash → Farsi message)
const FA_CACHE_PATH = resolve(__dirname, "changelog-fa.json");
let faTranslations = {};
if (existsSync(FA_CACHE_PATH)) {
  try {
    faTranslations = JSON.parse(readFileSync(FA_CACHE_PATH, "utf-8"));
  } catch {
    console.warn("⚠️  Could not parse changelog-fa.json, skipping Farsi translations");
  }
}

// Conventional-commit prefix → Farsi label map
const TYPE_MAP = {
  feat: "ویژگی جدید",
  fix: "رفع مشکل",
  refactor: "بازنویسی",
  chore: "نگه‌داری",
  docs: "مستندات",
  style: "ظاهری",
  perf: "بهبود عملکرد",
  test: "تست",
  ci: "CI/CD",
  build: "بیلد",
};

const TYPE_EN_MAP = {
  feat: "New Feature",
  fix: "Bug Fix",
  refactor: "Refactoring",
  chore: "Maintenance",
  docs: "Documentation",
  style: "Style",
  perf: "Performance",
  test: "Testing",
  ci: "CI/CD",
  build: "Build",
};

// Get all commits: hash | ISO date | subject
const SEP = "@@SEP@@";
const raw = execSync(
  `git log --pretty=format:"%H${SEP}%h${SEP}%aI${SEP}%s" --no-merges`,
  { cwd: ROOT, encoding: "utf-8" }
);

let missingTranslations = 0;

const entries = raw
  .trim()
  .split("\n")
  .filter(Boolean)
  .map((line) => {
    const [hash, shortHash, date, ...rest] = line.split(SEP);
    const message = rest.join(SEP);

    // Parse conventional commit prefix  →  "feat(scope): message"
    const match = message.match(
      /^(feat|fix|refactor|chore|docs|style|perf|test|ci|build)(?:\(([^)]+)\))?:\s*(.+)/i
    );

    const type = match ? match[1].toLowerCase() : "other";
    const scope = match ? match[2] || null : null;
    const cleanMessage = match ? match[3] : message;

    // Lookup Farsi translation; fall back to English message
    const messageFa = faTranslations[shortHash] || null;
    if (!messageFa) missingTranslations++;

    return {
      hash,
      shortHash,
      date,
      message: cleanMessage,
      messageFa: messageFa || cleanMessage,
      fullMessage: message,
      type,
      typeFa: TYPE_MAP[type] || "سایر",
      typeEn: TYPE_EN_MAP[type] || "Other",
      scope,
    };
  });

const outPath = resolve(ROOT, "public", "changelog.json");
writeFileSync(outPath, JSON.stringify(entries, null, 2), "utf-8");

console.log(`✅ Changelog generated: ${entries.length} entries → ${outPath}`);
if (missingTranslations > 0) {
  console.log(`⚠️  ${missingTranslations} commits missing Farsi translation (add to scripts/changelog-fa.json)`);
}

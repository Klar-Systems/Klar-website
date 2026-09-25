#!/usr/bin/env node
/* The site's test: every script the served pages load parses, and every local
 * link or asset a served page names exists. Exits 1 and names each failure.
 * Run: node scripts/check-site.mjs [repoRoot]
 *
 * WHAT IS SERVED. klarsystems.com serves public/ and nothing else — measured
 * 2026-09-25: /hinnat/ and /llms.txt answer 200, while the repo-root files
 * /README.md, /DESIGN.md, /v2.html, /tools/publish.py and /redesign/site.css all
 * answer 404. So the pages checked here are public/**; redesign/ and the root
 * drafts are sources (tools/publish.py copies redesign/ into public/).
 *
 * It exists so land.sh has a real test command for this repo (doctrine
 * commands.test) instead of "THE TESTS DID NOT RUN". It proves the served files
 * are whole and linked; it does not prove how they look. */
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname, resolve, relative, sep } from "node:path";
import vm from "node:vm";

const DEPLOY = process.argv.includes("--deploy");
const rootArg = process.argv.slice(2).find((a) => !a.startsWith("--"));
const root = resolve(rootArg || join(dirname(new URL(import.meta.url).pathname), ".."));
const site = join(root, "public");
const failures = [];

/* --deploy is the "build" land.sh runs: a static site has nothing to compile, so
 * what can break a deploy is its config — vercel.json not parsing, a redirect to
 * a page that does not exist, or .vercelignore hiding the served tree. */
if (DEPLOY) {
  let vj = null;
  try {
    vj = JSON.parse(readFileSync(join(root, "vercel.json"), "utf8"));
  } catch (err) {
    failures.push(`vercel.json: does not parse — ${err.message}`);
  }
  for (const r of vj?.redirects || []) {
    const dest = String(r.destination || "").split(/[?#]/)[0];
    if (!dest.startsWith("/") || dest.includes("$") || dest.includes(":")) continue;
    const target = join(site, dest);
    if (!existsSync(join(target, "index.html")) && !existsSync(target) && !existsSync(target + ".html")) {
      failures.push(`vercel.json: ${r.source} redirects to ${r.destination}, which does not exist`);
    }
  }
  const ignored = existsSync(join(root, ".vercelignore"))
    ? readFileSync(join(root, ".vercelignore"), "utf8").split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("#"))
    : [];
  for (const pat of ignored) {
    if (/^\/?public(\/|$)/.test(pat) || /\.html$/.test(pat) || pat === "*" || pat === "/*") {
      failures.push(`.vercelignore: "${pat}" would keep served pages out of the deploy`);
    }
  }
  if (!existsSync(join(site, "index.html"))) failures.push("public/index.html: missing — the home page would 404");
  if (failures.length) {
    for (const f of failures) console.log(`FAIL  ${f}`);
    process.exit(1);
  }
  console.log(`OK  vercel.json parses, ${(vj.redirects || []).length} redirects land on real pages, .vercelignore hides no served page.`);
  process.exit(0);
}

const walk = (d) =>
  existsSync(d)
    ? readdirSync(d).flatMap((f) => {
        const p = join(d, f);
        return statSync(p).isDirectory() ? walk(p) : [p];
      })
    : [];
const files = walk(site);
if (!files.length) {
  console.log("FAIL  public/: no files — nothing would be served");
  process.exit(1);
}

// 1. Every script parses.
const scripts = files.filter((f) => f.endsWith(".js"));
for (const f of scripts) {
  try {
    new vm.Script(readFileSync(f, "utf8"), { filename: f });
  } catch (err) {
    failures.push(`${relative(root, f)}: does not parse — ${err.message}`);
  }
}

// 2. Every local href/src resolves to a served file. A directory URL (/hinnat/)
// resolves to its index.html, as Vercel serves it.
const exists = (p) =>
  (existsSync(p) && statSync(p).isFile()) || existsSync(join(p, "index.html")) || existsSync(p + ".html");
const pages = files.filter((f) => f.endsWith(".html"));
const ATTR = /\b(?:href|src|poster)\s*=\s*"([^"]*)"/g;
for (const page of pages) {
  const html = readFileSync(page, "utf8");
  for (const m of html.matchAll(ATTR)) {
    const raw = m[1].trim();
    if (!raw || /^(?:[a-z][a-z0-9+.-]*:|\/\/|#|\$\{|\{)/i.test(raw)) continue;
    const path = decodeURIComponent(raw.split(/[?#]/)[0]);
    // /_vercel/* (Web Analytics, Speed Insights) is served by the platform, not the repo.
    if (!path || path.startsWith("/_vercel/")) continue;
    const target = path.startsWith("/") ? join(site, path) : join(dirname(page), path);
    if (!target.startsWith(site + sep) && target !== site) {
      failures.push(`${relative(root, page)}: "${raw}" points outside the served tree`);
    } else if (!exists(target)) {
      failures.push(`${relative(root, page)}: "${raw}" does not exist`);
    }
  }
}

if (failures.length) {
  for (const f of failures) console.log(`FAIL  ${f}`);
  console.log(`\n${failures.length} failure(s) over ${pages.length} page(s) and ${scripts.length} script(s).`);
  process.exit(1);
}
console.log(`OK  ${pages.length} served page(s): every local link resolves; ${scripts.length} script(s) parse.`);

#!/usr/bin/env node
/**
 * Write the contract's prices into the pricing and founding pages.
 *
 * The figures on those pages used to be typed. They are now OUTPUT: every one
 * of them sits inside a marker — `<span data-klar-price="id">…</span>` — or is
 * matched by shape in the `<head>` metadata and the JSON-LD blocks, and this
 * script replaces what is inside with whatever `docs/commercial-contract.json`
 * says today. scripts/price-tokens.mjs is where each value is computed; this
 * file only moves strings.
 *
 *     node scripts/render-prices.mjs            # write
 *     node scripts/render-prices.mjs --dry-run  # say what would change
 *
 * IT REFUSES TO INVENT A MARKER. A marker naming a token that does not exist is
 * a failure, not a no-op: an id typo would otherwise leave a stale price sitting
 * on the page looking generated. The same goes for a metadata phrase that has
 * gone missing — a pattern matching nothing stops the run.
 *
 * Exit 0 = the pages now match the contract. Exit 1 = nothing was written and it
 * says why.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { ROOT, CONTRACT_PATH, contract, fail, TOKENS, PATTERNS, PAGES, MARKER_RE } from "./price-tokens.mjs";

const dryRun = process.argv.includes("--dry-run");

console.log(`Commercial contract v${contract.version}, ruled ${contract.ruled_on}`);
console.log(`  read from ${CONTRACT_PATH}\n`);

let changedFiles = 0;
const changes = [];

for (const page of PAGES) {
  const full = join(ROOT, page);
  const before = readFileSync(full, "utf8");
  let after = before;

  // --- markers -------------------------------------------------------------
  const seen = new Set();
  after = after.replace(MARKER_RE, (whole, id, current) => {
    if (!(id in TOKENS)) {
      fail(`${page} — marker data-klar-price="${id}" names no token in scripts/price-tokens.mjs.`);
    }
    if (current.includes("<span")) {
      fail(
        `${page} — marker data-klar-price="${id}" contains another <span>. ` +
          `A marker holds a price and nothing else, so it can be read back without parsing HTML.`
      );
    }
    seen.add(id);
    const want = TOKENS[id];
    if (current !== want) changes.push(`${page}  ${id}\n          ${current}\n       -> ${want}`);
    return whole.replace(`>${current}</span>`, `>${want}</span>`);
  });

  // --- head metadata and JSON-LD ------------------------------------------
  for (const p of PATTERNS) {
    if (!p.files.includes(page)) continue;
    const hits = after.match(p.find);
    if (!hits || hits.length === 0) {
      fail(
        `${page} — the phrase behind "${p.id}" is not on the page (${p.find}). ` +
          `It quoted a price and now quotes nothing; that is a lost price, not a clean render.`
      );
    }
    for (const hit of new Set(hits)) {
      if (hit !== p.value) changes.push(`${page}  ${p.id}\n          ${hit}\n       -> ${p.value}`);
    }
    after = after.replace(p.find, p.value);
  }

  if (seen.size === 0 && !PATTERNS.some((p) => p.files.includes(page))) {
    fail(`${page} — carries no price marker at all. Nothing here derives from the contract.`);
  }

  if (after !== before) {
    changedFiles += 1;
    if (!dryRun) writeFileSync(full, after, "utf8");
  }
  console.log(
    `  ${after === before ? "unchanged  " : dryRun ? "WOULD WRITE " : "written    "}${page} — ${seen.size} token(s)`
  );
}

console.log("");
if (changes.length === 0) {
  console.log("Every figure already matched the contract. Nothing moved.");
} else {
  console.log(`${changes.length} figure(s) ${dryRun ? "would change" : "changed"}:\n`);
  for (const c of changes) console.log(`  ${c}`);
  console.log("");
  console.log(
    `${changedFiles} file(s) ${dryRun ? "would be" : "were"} rewritten. Read the list above before committing — ` +
      `a repriced public page is the thing this tool exists to make visible.`
  );
}

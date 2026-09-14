#!/usr/bin/env node
/**
 * Do the pricing and founding pages still say what the contract says?
 *
 * The other half of scripts/render-prices.mjs. The generator writes the
 * contract's figures into the pages; this asserts that nobody has since typed
 * over one, and that no price on those pages is authored anywhere but
 * `docs/commercial-contract.json`. Divergence is one red command instead of an
 * audit of two HTML files.
 *
 *     node scripts/check-prices.mjs
 *
 * WHAT IT ASSERTS
 *   1. Every marker's content equals the token the contract computes.
 *   2. Every token this tool defines is actually used by a page — a token that
 *      reaches no marker is a figure that quietly stopped being published.
 *   3. Every metadata and JSON-LD phrase that quotes a price says the contract's
 *      figure, and is still present at all.
 *   4. Every signup CTA names a plan id that is in the catalogue, IS publishable
 *      (`klar-ordering-149` is ruled unpublished and must never appear on this
 *      site) AND is one the signup wizard will actually accept. The last of
 *      those is not the same as the second, and the difference shipped a broken
 *      CTA on 2026-09-14 — see WIZARD_PLAN_IDS in price-tokens.mjs.
 *   5. No bare euro figure is left outside a marker on those pages. This is the
 *      one that matters: it is what stops a new price being hand-typed back in
 *      beside the generated ones.
 *
 * NOT WIRED INTO CI. Running it is a command, by hand or by whoever lands a
 * price change:  node scripts/check-prices.mjs
 *
 * Exit 0 = the pages agree with the contract. Exit 1 = at least one does not,
 * and it says which figure and what it found instead.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  ROOT,
  CONTRACT_PATH,
  contract,
  TOKENS,
  PATTERNS,
  PAGES,
  SIGNUP_BASE,
  PUBLISHABLE_PLAN_IDS,
  WIZARD_PLAN_IDS,
  MARKER_RE,
} from "./price-tokens.mjs";

const failures = [];
const passes = [];

/** Every euro figure written on a page, as either entity or symbol. */
const EURO_FIGURE_RE = /(?:&euro;|€)\s?[\d][\d,\s]*/g;
/** A percentage that is one of the founding programme's two shares. */
const FOUNDING_PCT_RE = new RegExp(
  `\\b(?:${TOKENS["founding.discount.pct"].replace("%", "")}|${TOKENS["founding.paid.pct"].replace("%", "")})%`,
  "g"
);

const tokensSeen = new Set();

for (const page of PAGES) {
  const text = readFileSync(join(ROOT, page), "utf8");

  // -------------------------------------------------------------------------
  // 1 + 2. Markers hold the contract's figure
  // -------------------------------------------------------------------------
  let markerCount = 0;
  const failuresBefore = failures.length;
  /** The page with every marker blanked out, so what is LEFT can be searched
   *  for figures nothing generated. */
  let unmarked = text.replace(MARKER_RE, (whole, id, current) => {
    markerCount += 1;
    tokensSeen.add(id);
    if (!(id in TOKENS)) {
      failures.push(`${page} — marker data-klar-price="${id}" names no token. It generates nothing.`);
    } else if (current.includes("<span")) {
      failures.push(
        `${page} — marker data-klar-price="${id}" contains another <span>, so its price cannot be read back.`
      );
    } else if (current !== TOKENS[id]) {
      failures.push(
        `${page} — ${id}\n      page says:     ${JSON.stringify(current)}\n      contract says: ${JSON.stringify(TOKENS[id])}`
      );
    }
    return "";
  });

  if (markerCount === 0) {
    failures.push(`${page} — carries no price marker at all. Nothing on it derives from the contract.`);
  } else if (failures.length === failuresBefore) {
    passes.push(`${page} — all ${markerCount} marker(s) match the contract`);
  }

  // -------------------------------------------------------------------------
  // 3. Metadata and JSON-LD quote the contract too
  // -------------------------------------------------------------------------
  for (const p of PATTERNS) {
    if (!p.files.includes(page)) continue;
    const hits = text.match(p.find) ?? [];
    if (hits.length === 0) {
      failures.push(
        `${page} — ${p.id} is gone from the page. It quoted a price; a phrase that vanished is a lost price, not a pass.`
      );
      continue;
    }
    const wrong = [...new Set(hits)].filter((h) => h !== p.value);
    if (wrong.length > 0) {
      failures.push(
        `${page} — ${p.id}\n      page says:     ${wrong.map((w) => JSON.stringify(w)).join(", ")}\n      contract says: ${JSON.stringify(p.value)}`
      );
    } else {
      passes.push(`${page} — ${p.id} quotes the contract (${hits.length}×)`);
    }
    // Blank the matched phrases so the sweep below does not re-flag them.
    unmarked = unmarked.replace(p.find, "");
  }

  // -------------------------------------------------------------------------
  // 4. Signup CTAs name a real, publishable plan
  // -------------------------------------------------------------------------
  const ctaIds = [...text.matchAll(/booking\.klarsystems\.com\/signup\?plan=([a-z0-9-]+)/g)].map(
    (m) => m[1]
  );
  if (ctaIds.length === 0) {
    failures.push(`${page} — no signup CTA. Every plan card links to the wizard; this page links to none.`);
  } else {
    const unpublishable = ctaIds.filter((id) => !PUBLISHABLE_PLAN_IDS.has(id));
    /* Publishable is not enough: the wizard refuses a plan its setup ladder does
     * not lead to, and refuses it SILENTLY — the customer lands on a derived plan
     * instead of the one they pressed. So a CTA must name a plan the route will
     * actually take. See WIZARD_PLAN_IDS. */
    const notOfferable = ctaIds.filter((id) => PUBLISHABLE_PLAN_IDS.has(id) && !WIZARD_PLAN_IDS.has(id));
    if (unpublishable.length > 0) {
      failures.push(
        `${page} — signup CTA names a plan that must not be published here: ${[...new Set(unpublishable)].join(", ")}`
      );
    } else if (notOfferable.length > 0) {
      failures.push(
        `${page} — signup CTA names a plan the wizard refuses, and refuses silently: ` +
          `${[...new Set(notOfferable)].join(", ")}. ` +
          `The wizard accepts ${[...WIZARD_PLAN_IDS].join(", ")}. Link Calendly for the rest.`
      );
    } else {
      passes.push(`${page} — ${ctaIds.length} signup CTA(s), every plan id one the wizard accepts`);
    }
  }

  // -------------------------------------------------------------------------
  // 5. Nothing outside a marker quotes a price
  //
  // The sweep is over what is LEFT once the markers and the checked phrases are
  // blanked. A figure found here is a price somebody typed in by hand, which is
  // the failure this whole tool exists to prevent — asserting only that the
  // generated figures are right would pass a page that had a second, wrong price
  // typed in beside them.
  // -------------------------------------------------------------------------
  const strays = [
    ...(unmarked.match(EURO_FIGURE_RE) ?? []),
    ...(unmarked.match(FOUNDING_PCT_RE) ?? []),
  ].map((s) => s.trim());
  if (strays.length > 0) {
    failures.push(
      `${page} — ${strays.length} figure(s) sit outside any marker and are authored by hand: ` +
        `${[...new Set(strays)].map((s) => JSON.stringify(s)).join(", ")}`
    );
  } else {
    passes.push(`${page} — no price is authored on the page itself`);
  }
}

// ---------------------------------------------------------------------------
// 2 (continued). A token nothing prints is a figure that stopped being published
// ---------------------------------------------------------------------------
const unusedTokens = Object.keys(TOKENS).filter((id) => !tokensSeen.has(id));
if (unusedTokens.length > 0) {
  failures.push(
    `Token(s) defined but printed nowhere: ${unusedTokens.join(", ")}. ` +
      `Either a marker was deleted from a page, or the token should go.`
  );
} else {
  passes.push(`Every one of the ${Object.keys(TOKENS).length} tokens reaches a page`);
}

// ---------------------------------------------------------------------------
// Result
// ---------------------------------------------------------------------------
console.log(`Commercial contract v${contract.version}, ruled ${contract.ruled_on}`);
console.log(`  read from ${CONTRACT_PATH}\n`);

for (const p of passes) console.log(`  ok    ${p}`);
for (const f of failures) console.log(`  FAIL  ${f}`);

console.log("");

if (failures.length > 0) {
  console.log(
    `${failures.length} assertion(s) disagree with the commercial contract. ` +
      `Fix the contract or re-run scripts/render-prices.mjs — do not retype the page.`
  );
} else {
  console.log(`All ${passes.length} assertions agree with the commercial contract.`);
}

process.exit(failures.length > 0 ? 1 : 0);

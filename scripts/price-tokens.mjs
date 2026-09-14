/**
 * Every price this site publishes, computed from the commercial contract.
 *
 * WHY THIS EXISTS: until now klarsystems.com was the only Klar price surface
 * that did not read `docs/commercial-contract.json`. Its figures were typed
 * into HTML by hand, which is exactly how the public site came to sell
 * website-only at one price while the money model said another. The contract is
 * the source; this file turns it into the strings the pages print; the pages
 * are the output.
 *
 * THE CONTRACT IS NOT COPIED INTO THIS REPO, and that is deliberate. A second
 * copy is a second place a price is authored, which is the thing being fixed. It
 * is read out of the klar-console checkout beside this one, and when that is not
 * on the machine both the generator and the guard STOP — a price tool that
 * cannot find the contract must never carry on with whatever the HTML happens to
 * say today.
 *
 *   scripts/render-prices.mjs  writes these values into the pages
 *   scripts/check-prices.mjs   fails when a page and these values disagree
 *
 * Both read this file, so there is exactly one definition of each figure.
 */

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** Stop, loudly, with a non-zero exit. Never continue on a guessed price. */
export function fail(message) {
  console.error(`\n  FAIL  ${message}\n`);
  process.exit(1);
}

/**
 * Where the contract lives. `KLAR_CONTRACT` first so a checkout in an unusual
 * place can be pointed at explicitly; then the sibling checkout, then one level
 * up for when this repo is worked in from a worktree directory.
 */
const CONTRACT_CANDIDATES = [
  process.env.KLAR_CONTRACT,
  resolve(ROOT, "../klar-console/docs/commercial-contract.json"),
  resolve(ROOT, "../../klar-console/docs/commercial-contract.json"),
].filter(Boolean);

export const CONTRACT_PATH = CONTRACT_CANDIDATES.find((p) => existsSync(p));

if (!CONTRACT_PATH) {
  fail(
    "docs/commercial-contract.json was not found. Looked in:\n" +
      CONTRACT_CANDIDATES.map((p) => `          ${p}`).join("\n") +
      "\n        The contract is the source of every price on this site. Check out\n" +
      "        klar-console beside this repo, or set KLAR_CONTRACT to the file."
  );
}

export const contract = JSON.parse(readFileSync(CONTRACT_PATH, "utf8"));

// ---------------------------------------------------------------------------
// Formatting — this site writes English, entity-escaped
// ---------------------------------------------------------------------------

/** Thousands grouped with a comma, by hand. `toLocaleString` emits U+00A0 on
 *  some runtimes and a plain space on others; the two look identical in a file
 *  and compare unequal, which is a bad way to lose a check. */
const grouped = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

/** The pages escape the currency symbol; the JSON-LD blocks do not. */
const eur = (n) => `&euro;${grouped(n)}`;
const eurPlain = (n) => `€${grouped(n)}`;

// ---------------------------------------------------------------------------
// The figures, looked up rather than typed
// ---------------------------------------------------------------------------

function plan(id) {
  const found = contract.plans.catalogue.find((p) => p.id === id);
  if (!found) fail(`commercial-contract.json has no plan "${id}" in plans.catalogue.`);
  return found;
}

function setupTier(key) {
  const found = contract.setup.tiers.find((t) => t.key === key);
  if (!found) fail(`commercial-contract.json has no setup tier "${key}".`);
  return found;
}

/**
 * The founding monthly, as `apps/booking/src/lib/setup-tiers.ts` computes it.
 *
 * The cap is a CEILING, not a flat price: never more than €200, and never more
 * than the tier's own list. On Klar Bookings the list is €149, so a flat €200
 * would put a founding partner above their own list price. That implementation
 * is the one implementation — this mirrors it rather than re-deriving it.
 */
function foundingMonthly(tierMonthlyEur) {
  const cap = contract.founding_programme.monthly_cap_eur;
  const isLocked = tierMonthlyEur > cap;
  return { eur: isLocked ? cap : tierMonthlyEur, isLocked };
}

/** The founding partner's setup, as setup-tiers.ts `foundingEur` computes it. */
const foundingEur = (listEur) => Math.round(listEur * contract.founding_programme.setup_multiplier);

/** "40% off" as a percentage of the list price, derived from the multiplier so
 *  the discount and the multiplier can never say two different things. */
const discountPct = Math.round((1 - contract.founding_programme.setup_multiplier) * 100);
const paidPct = Math.round(contract.founding_programme.setup_multiplier * 100);

/**
 * The founding programme is sold as the full package — Klar Complete — so the
 * monthly it advertises is the `complete` tier's, put through the cap.
 */
const completeTier = setupTier("complete");
const completeMonthly = plan(completeTier.leads_to_plan).amount_eur;
const founding = foundingMonthly(completeMonthly);

/**
 * The published copy says the founding monthly is "locked". That claim is only
 * true where the cap actually bit. If a repricing ever put Klar Complete at or
 * below the cap, the pages would be promising a lock that is not a discount —
 * so this stops rather than rendering it.
 */
if (!founding.isLocked) {
  fail(
    `The founding monthly cap (€${contract.founding_programme.monthly_cap_eur}) no longer bites: ` +
      `${completeTier.leads_to_plan} lists at €${completeMonthly}. The pages say the founding ` +
      `monthly is "locked", which would no longer be true. This is an operator ruling, not a render.`
  );
}

/**
 * The per-order, per-cover, per-booking fee, which is the whole point of the
 * company. It is a figure the page prints, so it is derived rather than typed:
 * it reads €0 because `rules_that_do_not_bend` forbids the fee, and if that rule
 * ever left the contract the page would be printing a promise nothing backs.
 */
const NO_TRANSACTION_FEE = contract.rules_that_do_not_bend.some((r) =>
  r.includes("No fee per order")
);
if (!NO_TRANSACTION_FEE) {
  fail(
    'The contract no longer carries "No fee per order. No fee per booking." in ' +
      "rules_that_do_not_bend, so the pages must stop printing €0 for it. That is an " +
      "operator ruling, not a render."
  );
}

const setupMin = contract.setup.band_eur.min;
const setupMax = contract.setup.band_eur.max;
const setupMid = contract.setup.midpoint_eur;

/**
 * Every figure, as the exact string the page prints.
 *
 * `rules_that_do_not_bend`: "Every price is alv 0 % and prints its basis on the
 * same line as the number." So the basis is part of the token, not something the
 * surrounding prose is trusted to add — a figure and its basis that can be
 * separated will eventually be separated.
 */
export const TOKENS = {
  // Klar Complete — the three usage bands
  "complete.head.lead": `From ${eur(plan("klar-300").amount_eur)}`,
  "plan.klar-300.monthly": `${eur(plan("klar-300").amount_eur)}/month + VAT`,
  "plan.klar-750.monthly": `${eur(plan("klar-750").amount_eur)}/month + VAT`,
  "plan.klar-1500.monthly": `${eur(plan("klar-1500").amount_eur)}/month + VAT`,

  // Klar Single — the standalone plans
  "single.head.lead": eur(
    Math.min(
      contract.website_only.monthly_eur,
      plan("klar-bookings").amount_eur,
      plan("klar-ordering").amount_eur
    )
  ),
  "plan.klar-website-only.monthly": `${eur(contract.website_only.monthly_eur)}/month + VAT`,
  "plan.klar-bookings.monthly": `${eur(plan("klar-bookings").amount_eur)}/month + VAT`,
  "plan.klar-ordering.monthly": `${eur(plan("klar-ordering").amount_eur)}/month + VAT`,

  // Setup — the published band, written spaced in one place and tight in others
  "setup.band.spaced": `${eur(setupMin)} &ndash; ${eur(setupMax)} + VAT`,
  "setup.band.tight": `${eur(setupMin)}&ndash;${eur(setupMax)} setup + VAT`,
  "setup.head.lead": eur(setupMin),
  "setup.head.rest": `&ndash;${eur(setupMax)} + VAT`,
  "setup.min.vat": `${eur(setupMin)} + VAT`,
  "setup.max.vat": `${eur(setupMax)} + VAT`,
  "website_only.setup": `${eur(contract.website_only.setup_eur)} setup + VAT`,
  "website_only.setup.vat": `${eur(contract.website_only.setup_eur)} + VAT`,

  // Founding programme
  "founding.monthly.cap": `${eur(founding.eur)} a month + VAT`,
  "founding.monthly.cap.bare": eur(founding.eur),
  "founding.discount.pct": `${discountPct}%`,
  "founding.paid.pct": `${paidPct}%`,
  "founding.setup.pair": `${eur(setupMid)} + VAT, you pay ${eur(foundingEur(setupMid))} + VAT`,

  // The fee that does not exist
  "fee.per.transaction": eur(0),
};

/**
 * The `<head>` metadata and the JSON-LD blocks quote prices too, and neither can
 * hold a marker element — a `<meta content="...">` has nowhere to put one and a
 * JSON string may not contain markup. Those are matched by shape instead: the
 * pattern finds the phrase however its figure currently reads, and `value` is
 * what that phrase must say. A phrase that has gone missing entirely fails as
 * loudly as one that disagrees, because a check that silently found nothing is
 * not a check that passed.
 */
export const PATTERNS = [
  {
    id: "meta.complete.from",
    files: ["public/pricing/index.html"],
    find: /from EUR [\d,]+ a month/g,
    value: `from EUR ${grouped(plan("klar-300").amount_eur)} a month`,
  },
  {
    id: "jsonld.founding.monthly",
    files: ["public/founding/index.html"],
    find: /€[\d,]+ a month \+ VAT, locked/g,
    value: `${eurPlain(founding.eur)} a month + VAT, locked`,
  },
  {
    id: "jsonld.founding.monthly.bare",
    files: ["public/founding/index.html"],
    find: /You pay €[\d,]+\./g,
    value: `You pay ${eurPlain(founding.eur)}.`,
  },
  {
    id: "jsonld.founding.setup.pair",
    files: ["public/founding/index.html"],
    find: /Quoted €[\d,]+(?: \+ VAT)?, you pay €[\d,]+(?: \+ VAT)?\./g,
    value: `Quoted ${eurPlain(setupMid)} + VAT, you pay ${eurPlain(foundingEur(setupMid))} + VAT.`,
  },
  {
    id: "meta.founding.discount",
    files: ["public/founding/index.html"],
    find: /\d+% off the setup fee/g,
    value: `${discountPct}% off the setup fee`,
  },
  {
    id: "jsonld.founding.discount",
    files: ["public/founding/index.html"],
    find: /\d+% off your setup fee/g,
    value: `${discountPct}% off your setup fee`,
  },
  {
    id: "jsonld.founding.paid",
    files: ["public/founding/index.html"],
    find: /at \d+% of what it costs/g,
    value: `at ${paidPct}% of what it costs`,
  },
];

/** The pages this tool owns. Nothing else on the site is touched by it. */
export const PAGES = ["public/pricing/index.html", "public/founding/index.html"];

/** Where a self-serve CTA sends someone. */
export const SIGNUP_BASE = "https://booking.klarsystems.com/signup?plan=";

/**
 * Every plan id that may appear in a published signup link.
 *
 * `klar-ordering-149` is in the catalogue and is deliberately NOT here: the
 * contract rules it unpublished — a public €149 ordering tier beside the
 * published €199 one shows every other ordering customer a cheaper price for
 * what looks like the same thing. Klar Enterprise is not here either; it is a
 * route to a person and has no amount to sign up against.
 */
export const PUBLISHABLE_PLAN_IDS = new Set(
  contract.plans.catalogue.filter((p) => !p.trial_key).map((p) => p.id)
);

/** Marker elements. A marker may not contain another `<span>`, so its content
 *  can be read back without parsing HTML — the guard asserts that. */
export const MARKER_RE = /<span\b[^>]*\bdata-klar-price="([^"]+)"[^>]*>([\s\S]*?)<\/span>/g;

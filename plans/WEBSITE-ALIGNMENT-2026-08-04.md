# Klar website ↔ klar-console alignment audit

**Date:** 2026-08-04
**Sources audited:** `klar-console` @ `3143e0c` (main) — `README.md`, `VISION.md`, `GOAL.md`,
`TOP-10.md`, `config/platform.json`, `docs/onboarding/*`, `docs/ARCHITECTURE.md`,
`apps/booking/src/**` (routes, libs), `sites/*`, `.gitmodules`.
**Website audited:** `Klar-website` @ `88481e0` — `public/index.html` (the live file),
`index.html` (WIP redesign, root).
**Also binding:** `MONEY-MODEL.md` (operator, 2026-08-04 — supersedes all earlier pricing) and
Quandoo's public shutdown notice, <https://www.quandoo.fi/en/important-update>.

> **Deploy note before anyone edits:** the live site serves `public/`. The root `index.html`
> is a work-in-progress redesign and is **not** what klarsystems.com shows. Every copy change
> below must land in `public/index.html` (or be merged from the WIP branch into `public/`).

---

## 1. The one-line problem

The website sells **a website + a booking system + SEO**.
The platform, as of today, is **a three-product operator business**: website, commission-free
**bookings**, and commission-free **online ordering** (live in production since 2026-07-26) —
plus an AI guest-marketing and reputation layer that the site never mentions at all.

The site is **two products and one full year of engineering behind** — and, separately, it makes
**two commercial promises the business does not intend to keep** ("no contracts", and a monthly
rate with no setup fee). Those two are the urgent fix; the missing products are the big one.

There is also a **57-day window** open right now that the site is barely using: Quandoo's
shutdown is real, dated, and public. See §4.4.

---

## 2. What the platform actually is (from the repo, verified)

| Thing | Status in repo | On the website? |
|---|---|---|
| Multi-tenant booking (`apps/booking`) | ✅ live prod, `booking.klarsystems.com` | ✅ yes |
| **Native online ordering** (menu, order, eat-in/takeaway, owner queue) | ✅ **live prod**, pilots `ravintola-ani` + `boom16` `enabled: true` | ❌ **no** |
| Post-visit **feedback + guest reviews** + Google-review routing | ✅ live (`/review/:id`, `/feedback/:id`, cron) | ❌ no |
| **AI guest marketing** — win-back, birthday, personalised messages | ✅ built (`ai-client.ts`, `ai-prompts.ts`, `/admin/:slug/campaigns`, `ANTHROPIC_API_KEY` is a required prod env) | ❌ no |
| Automated guest emails: confirmation, 24h + 3h reminders, feedback request | ✅ live, 6 scheduled crons | ❌ no |
| Waitlist | ✅ live (`/waitlist`, `/api/:slug/waitlist`) | ❌ no |
| Floor plan + table assignment (best-fit, two-table combos, overbooking resolution) | ✅ live (`/admin/:slug/floorplan`, `table-assignment.ts`) | ❌ no |
| Guest CRM: import, auto-tagging, tag rules, iCal export, webhooks | ✅ live (`/admin/:slug/guests/import`, `auto-tag.ts`, `/admin/ical`, `/admin/webhooks`) | 🟡 one line ("guest CRM") |
| Staff accounts, invites, per-route permissions | ✅ live (`/admin/:slug/staff`, `/invite/:token`, `permissions.ts`) | ❌ no |
| Booking funnel analytics + monthly owner report | ✅ live (`widget_events`, `/admin/:slug/report`, `monthly-summary` cron) | 🟡 claimed, under-evidenced |
| **Google Reserve** partner API ("Reserve with Google") | ✅ routes exist (`/api/reserve/merchants|availability|booking`) | 🟡 implied only |
| Website generator (`packages/sites` / `build_lead.py`) | 🟡 Python engine works; console automation = WS-E | ✅ sold as "custom website" |
| **SEO / AEO engine** (`packages/seo`) | ⚠️ **`"classification": "dormant"`** in `config/platform.json` | ✅ **sold as a product** |
| **Ads** (`packages/ads`) | ⚠️ **dormant** | ❌ not sold (correct) |
| Console CRM/billing (`apps/console`) | 🟡 skeleton, internal only | n/a — internal |
| Guest online payment | ⛔ **deliberately deferred** — guest pays at the restaurant | n/a |
| Delivery | ⛔ **never** — no drivers, no addresses in the build | n/a |

**Live client sites pinned in `config/platform.json`:** `robadeli.fi`, `lalasagnahelsinki.com`,
`efmdevelopment.com`, `ravintola-ani-ten.vercel.app`, `boom16.vercel.app`, `kiku86`
(no domain yet — operator provisioning required). `kulta-kello.fi` is flagged
`operator-dns-repair-required` — do **not** link it as proof until DNS is fixed.

---

## 3. The gaps, ranked by revenue impact

### GAP 1 — Online ordering is missing entirely. This is the biggest one.

The page spends a full section on the Quandoo per-cover fee (€2–4 per booking). Meanwhile the
platform now ships the thing that attacks a **far bigger** number: delivery-platform commission.
Per `MONEY-MODEL.md`, the anchor is **30% commission on a €30 average order = ~€9 lost per
order**, which at real Helsinki volumes is:

| Orders/month | Lost to platform commission |
|---:|---:|
| 100 | €900/mo |
| 300 | €2,700/mo |
| 500 | €4,500/mo |
| 800 | €7,200/mo |

Against Klar's **€0 commission, guest pays at the restaurant**. The payback line the money model
gives is the single best sentence available for the whole website:

> **About 28 direct orders a month covers the entire Klar subscription.**

**Critical positioning constraint from the money model — do not get this wrong on the page:**
the offer is **not** "leave Wolt." It is *"keep Wolt for discovery; own your repeat customers."*
Any copy telling restaurants to quit the delivery apps will read as naïve to an owner whose
volume comes from there, and it contradicts the sales script. The framing is **channel
ownership**, not boycott.

What is actually shipped and can be sold today:
- Guest orders **on the restaurant's own site**, in the restaurant's own design — not on a
  third-party marketplace that owns the customer.
- **Eat-in or takeaway** chosen at checkout (per-client capability, `allows_eat_in`); pickup-only
  for takeaway spots. **No delivery, by design** — say this plainly, it's a scope decision, not a
  weakness.
- Guest **pays at the restaurant** → the restaurant keeps 100%, and Klar carries no card data.
- Owner side: order queue, **audible new-order alert** in the kitchen, ready-time estimate,
  post-order guest review with Google-review routing.
- Live proof: Ravintola Ani since 2026-07-26, Boom16 enabled.

**Action:** a dedicated ordering section on the home page + its own `/ordering` page, framed
exactly like the existing Quandoo section but against delivery-app commission. Reuse the proven
structure: *the problem → the number it costs you → what Klar does instead → the comparison
table → migration is done for you.*

### GAP 2 — No reviews / reputation story

Restaurants care about Google rating above almost everything. Klar ships: automatic post-visit
feedback email, a guest review flow, an order-review flow, and a configurable Google review link
that routes happy guests to the public review page. The site says nothing. Add it — this is a
top-three buying trigger and it is already built.

### GAP 3 — No AI story, on a product with AI in required production env

`ANTHROPIC_API_KEY` is a **required production variable** for booking. The system writes
personalised win-back messages from real visit history (last visit, visit count, average party
size, tags, season, language), birthday messages, event suggestions, and runs learning loops on
message effectiveness and attribution — with versioned prompts and a per-restaurant AI budget.

The current page uses "AI" only defensively ("ChatGPT and Perplexity can find you"). The offensive
version — *"your empty Tuesday gets filled by messages we write to the guests who already love
you"* — is a stronger sale and it is built.

### GAP 4 — The booking feature list is a fraction of what exists

Currently: widget, dashboard, push notifications, guest CRM, data ownership. Missing: waitlist,
floor-plan and automatic table assignment, staff accounts with permissions, automated
reminders (which is the **no-show** story — never stated), guest-list import from your current
provider, iCal export, funnel analytics, monthly report, Reserve-with-Google. The competitor
table would look very different with these in it.

### GAP 5 — No proof, and the two testimonials have to come out

**Operator decision (2026-08-04): client names may NOT be used yet.** So the "Restaurants running
on Klar" strip is off the table for now, and the consequence lands on the two anonymous
"Restaurant owner · Helsinki" quotes: **remove them.** Two unattributed testimonials on a page
with zero named clients, zero logos and zero screenshots read as invented, and they cost more
credibility than they earn.

What replaces them — proof that needs nobody's permission:
- **Product screenshots**: the booking flow, the owner dashboard, the order queue. Show the real
  thing instead of asserting it.
- **The Quandoo deadline with its source link** (§4.4) — externally verifiable urgency.
- **Mechanism as proof**: "your guest data export is one click, and every write is recorded in an
  append-only ledger" beats a stranger saying the product is good.
- Keep the guarantees — they are risk-reversal, which is what testimonials were standing in for.

Revisit when a client clears their name; the strip is the cheapest upgrade available the day
that happens.

---

## 4. Claims on the live site that the repo contradicts — fix before adding anything

> Items 0a and 0b come from `MONEY-MODEL.md` (operator, 2026-08-04 — supersedes all earlier
> pricing). They are the two most serious problems on the live page: both are **commercial
> promises the business does not intend to keep**, which is a different and worse category than
> the stale product copy below.

0a. **"No contracts." / comparison table: Klar contract = "Cancel anytime."** — ❌ **FALSE, and
   confirmed false by the operator (2026-08-04).** There *is* a contract: **12 months.** A client
   can stop using the service whenever they like, but **the contract still holds** — the committed
   months are still owed. The only exception is a genuine change in circumstances (the restaurant
   closes, changes hands, something real), and that is handled by **talking to us**, case by case
   — not by a cancel button.

   So "No contracts" comes out of the hero, and the comparison row inverts. Write it as the
   operator described it, because the honest version is *more* persuasive than the false one:

   > **Is there a contract?** Yes — 12 months. That's what lets us build your entire system up
   > front and charge €249 a month instead of €900.
   >
   > **What if you want out?** You can stop using it whenever you want; the 12-month commitment
   > stands. And if something real changes — you sell the place, you close, life happens — you
   > talk to us. We're people in Helsinki, not a cancellation form.
   >
   > **What we never do:** take a percentage of your sales, charge per order, charge per cover,
   > or send you a bill you didn't expect.

   **Comparison table row — replace "Cancel anytime" with:**

   | | Quandoo | Klar |
   |---|---|---|
   | Contract | Annual + 3-month notice — **and €2–4 every time a guest sits down** | 12 months — **€0 per cover, ever** |

   Contract length is a tie, so stop pretending to win it. The per-cover fee is the kill shot,
   and it survives any amount of scrutiny.

0b. **"One flat monthly rate" with no mention of the setup fee.**
   The money model sets a **€1,900–€2,600 one-time setup fee** (50% before work, 50% before
   launch). The "What this replaces" table lists the agency website build at "€2,000–€5,000
   one-time" and then puts Klar's column at "one flat monthly rate" — which reads as *no upfront
   cost at all*. Combined with the hero line **"We build your restaurant's site before you pay.
   See it, then decide,"** the page implies a free build. It is a €2,250-ish surprise waiting in
   the first sales call, and it will cost trust exactly when the deal is closing.
   **Fix:** state the setup fee. It survives contact with the comparison table anyway — €1,900–2,600
   once versus €2,000–5,000 for an agency build that includes no booking, no ordering, no CRM and
   no ongoing work. That's a *stronger* row than pretending the fee doesn't exist. Keep "see it
   before you pay" only if the preview-before-deposit flow is real; otherwise cut it.

1. **"Reservation widget on your website."**
   Superseded by operator decision 2026-07-24: booking (and ordering) are built **natively into
   each restaurant's own site, styled per tenant** — explicitly *not* one shared widget/iframe
   reused across clients ("a fast-food spot and a five-star restaurant must not share one booking
   look"). The `widget.js` iframe is the transitional implementation. **Sell the new frame:**
   "booking built into your site, in your design" — it is both true and a better pitch.

2. **"SEO & AI Search"** as a systematised product. — **DECIDED: sell it as a done-for-you
   service.**
   `packages/seo` and `packages/ads` are `"classification": "dormant"`; the work is hand-delivered
   per client today. Operator decision (2026-08-04): keep the same promise, drop the implied
   engine. Copy should read as *we do this work for you, on your site, every month* — not as
   automated software. Keep the ChatGPT/Perplexity discovery angle (it is a real service we
   perform); do not promise ad management (the site correctly doesn't).

3. **"Monthly Performance Report — how many people found you, what they clicked, where new
   customers came from."**
   The **booking/order** half is real and strong (funnel events, monthly summary, attribution).
   The **traffic/SEO/ads** half is manual. Either scope the claim to reservations and orders, or
   state plainly that traffic numbers come from Google's own tools that Klar sets up and reads
   for you.

4. **"Quandoo is shutting down in Finland in September 2026."** — ✅ **VERIFIED TRUE, and the
   site is under-selling it.** Confirmed against Quandoo's own notice
   (<https://www.quandoo.fi/en/important-update>, announced 2026-03-24). It is a **worldwide**
   shutdown, not just Finland, on a published timeline:

   | Date | What happens |
   |---|---|
   | 2026-06-30 | last day to earn loyalty points *(already passed)* |
   | **2026-09-30** | **last day to make a new reservation on Quandoo** |
   | 2026-10-01 | all consumer services end; restaurants can no longer manage new or existing bookings |
   | 2026-12-31 | website, app and all infrastructure permanently offline |

   **Today is 2026-08-04 — that is 57 days.** Every Quandoo restaurant in Finland must have a
   replacement running before 30 September or it loses its reservation channel outright. The
   current copy states this as a soft aside near the bottom of the Bookings section. It should be
   a **dated, sourced, above-the-fold campaign** with the real deadline, the Quandoo link as
   proof, and the done-for-you migration as the offer. This is the most time-sensitive asset the
   page has, and its value expires in under two months.

5. **7 days vs 5 working days.** The hero and guarantee say 7 days; step 2 of "How it works"
   says 5 working days. Pick one number and use it everywhere.

6. **Anonymous testimonials — remove both.** Operator decision: no client names yet (§3 GAP 5),
   so they cannot be attributed, and unattributed quotes on a page with no named clients read as
   invented. Replace with product screenshots + the sourced Quandoo deadline.

7. **English only** (`lang="en"`). The product ships Finnish guest confirmations, and the
   customers are Helsinki restaurants. A Finnish version of the home page is a real conversion
   gap, not a nicety.

**Well-supported claims — keep, and strengthen with the mechanism:**
€0 per-cover fees; guest data ownership (governed writes, append-only audit ledger, guest data
export endpoint, "if you leave, you take it with you"); one partner replacing several vendors;
same-day updates; done-for-you migration.

---

## 5. What the site should say about price

Source: `MONEY-MODEL.md` (2026-08-04, supersedes all earlier pricing). The live site currently
shows **no prices at all** and routes everything to a call.

**Recommendation: publish the entry price. Do not keep hiding it.** Reason specific to this
moment: the Quandoo deadline is about to send a wave of *high-intent, deadline-driven* traffic
that is comparison-shopping under time pressure. Price-hiding taxes exactly that visitor — they
bounce to a competitor who shows a number rather than book a call to find one out. Publishing
"from €249/month + €1,900–€2,600 setup" also pre-qualifies the calls, which matters when the
team is small and the deadline is 57 days out.

What to publish:

| Line | Public copy |
|---|---|
| Klar Complete | **From €249/month** + **€1,900–€2,600 one-time setup** |
| Klar Bookings only | From €149/month |
| Klar Ordering only | From €199/month |
| Commission / per-cover | **€0. Never a percentage of sales, never a fee per order or per booking.** |
| Term | 12-month minimum |
| Priced separately | Google/Meta ad management, ad spend, delivery, multi-location, custom integrations |

Rules the page must respect (from the money model, non-negotiable):
- **Never show "€50/month" anywhere near the platform plans.** Website-Only at €50 exists solely
  for a client with no booking, no ordering, no CRM and no support. Putting it on the main
  pricing table trains every prospect to anchor at €50 and ask why Complete costs five times
  more for "the same website."
- **Tiers are usage-based** (completed orders + arrived booked covers: 300 / 750 / 1,500). If
  tiers are shown, show them as *"your price follows real activity"* — that is a fairness story,
  and it is the opposite of a per-order fee. Note the thresholds are 🟡 unvalidated until 8–12
  weeks of live data, so publishing the exact bands now is optional; publishing the €249 floor is
  not.
- **No percentage of revenue, no per-order fee, no per-booking fee, no surprise bills** — this is
  the strongest message the business has and the page should state it in those words.

**Conflict to resolve — the Founding Partner block.** It promises "the lowest rate we'll ever
offer, **locked permanently**." The money model prices by usage, so a founding client that grows
from 300 to 1,500 activity units is supposed to move €249 → €599. Those cannot both be true.
Decide which: lock the *tier price* (they move bands, but always at founder rates) or lock the
*plan price* (they stay €249 forever regardless of volume — expensive, but a real scarcity
hook). Then say exactly that on the page. Ambiguity here becomes a billing dispute with the
first customer who grows.

**The two guarantees — operator ruling 2026-08-04:**

- ✅ **7-Day Delivery Guarantee is real. Keep it, and give it more room than it has now.** It is
  the only hard, checkable promise on the page and it directly answers the "agencies take six
  weeks" objection. Consider restating the penalty against the setup fee rather than the monthly
  fee — with €1,900–2,600 paid up front, "your first month is free" (€249) is a small number in a
  place where the prospect is risking ten times that.
- ⚠️ **60-Day Results Guarantee — status unknown, so pull it until confirmed.** It is a money
  commitment tied to "measurable new traffic," a term nobody has defined, on a page that is about
  to publish prices. Leaving an unowned guarantee live is a liability; removing it costs almost
  nothing because the 7-day guarantee already carries the risk-reversal. Put it back the moment
  someone defines "measurable" and agrees to honour it.

---

## 6. The calculator — the centrepiece of the new page

**Operator instruction (2026-08-04):** build a calculator that shows what the restaurant pays
delivery apps and booking platforms today, against Klar — and make it obvious that **the setup
fee and the website are already inside the Klar price**, and that the setup fee amounts to about
*one month* of what the platforms currently take. Make it a no-brainer.

This replaces the static "What this replaces" table as the page's main persuasion device. That
table argues with generic market ranges; the calculator argues with **the owner's own numbers**,
which is the exact instruction in the money model's sales script ("use the restaurant's real
statement whenever possible"). Same argument, run on their data, in their browser, before they
ever talk to us.

### 6.1 Inputs — five fields, all pre-filled, all editable

| # | Input | Default | Notes |
|---|---|---|---|
| 1 | Delivery-app orders per month | 200 | Wolt + Foodora combined |
| 2 | Average order value | €30 | money-model anchor |
| 3 | Commission you pay | 30% | **user-entered.** See the accuracy guard in 6.5 |
| 4 | Booked covers per month | 250 | 0 if they take no reservations |
| 5 | Per-cover fee / booking platform monthly fee | €3 / €130 | Quandoo-range defaults |

Plus one slider that makes the whole thing credible:

| Slider | Default | Label on the page |
|---|---|---|
| Share of orders you move to your own channel | **30%** | *"You keep Wolt. This is just the repeat customers who'd come to you directly."* |

**That slider is not a decoration — it is the honesty mechanism.** The money model's position is
explicitly *keep Wolt for discovery, move repeat customers to a channel you own*. A calculator
that zeroes out delivery commission would contradict the sales script and read as fantasy to any
owner whose volume comes from those apps. At 30% it still produces a number that closes the deal.

### 6.2 The math (verified against the defaults above)

**What you pay today**

```
delivery commission   200 × €30 × 30%          = €1,800 / month
per-cover fees        250 × €3                 =   €750 / month
booking platform fee                           =   €130 / month
                                                 ─────────────────
                                     TODAY     = €2,680 / month
                                                 €32,160 / year
                              + agency website   €2,000–5,000 one-time
```

**What you pay with Klar** *(keeping Wolt, moving 30% of orders direct)*

```
delivery commission   140 × €30 × 30%          = €1,260 / month   (60 orders now direct, €0)
per-cover fees                                 =     €0
booking platform fee                           =     €0
Klar Complete                                  =   €249 / month
                                                 ─────────────────
                                    WITH KLAR  = €1,509 / month
                             one-time setup      €1,900–2,600  ← your website is in here
```

**The three headline outputs — these are the whole point of the widget**

| Output | At the defaults | Copy on the page |
|---|---|---|
| Your setup fee vs one month of platform fees | €2,250 vs €2,680 | **"Your entire setup — website included — costs less than one month of what the platforms take from you."** |
| Setup paid back in | €2,250 ÷ €1,171 saved/mo = **1.9 months** | "Paid back in under two months. Then it just keeps paying." |
| Year-one difference | €35,160 → €20,358 | **"€14,802 back in your pocket in year one."** |

And the money model's best single line, computed live from their inputs:

> **"About 28 direct orders a month covers your entire Klar subscription."**
> *(€249 ÷ (€30 × 30%) = 27.7 — recompute from their AOV and commission.)*

### 6.3 Show the arithmetic, don't just show the answer

Restaurant owners distrust a box that spits out a big number. Render each line of the math above
as a visible row that updates as they drag the sliders. The persuasion comes from *watching* the
commission column pile up, not from the total. Every figure on screen must trace to a number they
typed.

### 6.4 Placement

- Its own anchored section, `#laskuri` / `#calculator`, directly after the ordering section.
- Linked from the hero ("**See what the platforms cost you →**") — this is a stronger
  above-the-fold CTA than a second "Book a Free Call" button.
- Embedded again on `/ordering` and on the `/quandoo` landing page, with the Quandoo page
  defaulting field 4 to a per-cover fee and a visible 30 September deadline.
- Ends with the real CTA: *"Book a free call and we'll run this with your actual invoices."*
- Static HTML + a small inline `<script>` — no build step, matching how this repo already works.

### 6.5 Accuracy guards — do not skip these

- **Do not print a claim about what Wolt or Foodora charge.** Commission varies by agreement.
  Ship a neutral, user-editable default with a footnote: *"Delivery commissions in Finland
  generally run 14–30% depending on your contract — enter what you actually pay."* Every number
  on screen is then the restaurant's own assertion, not ours.
- **Same for Quandoo:** €2–4 per cover is already on the live site and is defensible as a range;
  keep it as an editable default, not a fixed claim.
- **Never show a saving that assumes they leave Wolt entirely.** Cap the direct-share slider at a
  realistic ceiling (suggest 60%) and keep the default at 30%.
- **Setup fee shows as the €1,900–€2,600 range**, with the midpoint used in the maths and a note
  that the final figure depends on scope. Do not display a single hard price the sales call then
  contradicts.
- **The 12-month term appears in the calculator's fine print**, not only on the pricing section —
  this is where a prospect commits mentally, and §4.0a exists so they never feel misled later.

---

## 7. Recommended shape of the updated site

Today: one long page selling one bundle.
Proposed: one page that sells **three products under one operator**, plus depth pages.

```
/                 Home — the operator promise + the three products, each with proof
                    1. Your website          (built, hosted, updated same-day, SEO)
                    2. Klar Bookings         (€0 per cover · your guests · your data)
                    3. Klar Ordering         (€0 commission · eat-in or takeaway · NEW)
                  + THE CALCULATOR (§6) — the page's main persuasion device
                  + Pricing: from €249/mo + €1,900–2,600 setup, €0 commission
                  + Product screenshots (no client names available yet)
                  + What this replaces (keep as backup to the calculator)
                  + Guarantees (keep) + Founding partner (keep)
/bookings         Depth page: full feature list, Quandoo comparison, migration
/ordering         NEW depth page: commission math vs delivery apps, how it works,
                  "no delivery — by design"
/quandoo          NEW landing page: the 30 Sept deadline, sourced, + migration offer.
                  Highest-intent traffic on the market right now, and it expires.
/fi               Finnish home page
```

`/work` (named live sites) is **deferred** until a client clears their name — see §3 GAP 5.

### Draft framing for the new ordering section (home page)

> **The commission problem**
> Every takeaway order through a delivery app costs you 15–30%. On a €25 order that is up to
> €7.50 — on a customer who already knows your name and would have called you.
>
> **Klar Ordering — €0 commission, on your own site.**
> Your guests order from your menu, on your website, in your design. They choose eat-in or
> takeaway and pay at the restaurant. You keep the whole ticket, and you keep the customer.
> No delivery, no couriers, no marketplace between you and your guest.
>
> Orders land in one screen with an audible alert in the kitchen, with a ready-time estimate for
> the guest, and every completed order asks the guest for a review.
>
> *Running live in Helsinki restaurants today.* — unnamed, per the no-client-names decision;
> swap in the real names the day one clears.

---

## 8. Work order — status

> **Built and verified in `public/index.html` on 2026-08-04** (items 2–7 below, plus the
> calculator). Executed in a real DOM: no JS errors, sliders recalculate live, edge cases
> handled. Committed locally on `design-md-klar-refresh` — **not pushed, not deployed.**
>
> Shipped in that pass:
> - **The calculator** (§6) — live, with the corrected framing. It never displays a blended
>   monthly total; Klar's €249 is shown as a single deduction against recovered money, so the
>   page can never be misread as "Klar costs €1,509/month."
> - **Hero rewritten** to the commission frame: *"Stop renting your own customers."*
>   "No contracts" removed. Primary CTA is now the calculator, not a call.
> - **New Commission-problem section + Klar Ordering section** — the missing product (GAP 1),
>   with the "keep Wolt, own your regulars" framing and "no delivery, by design" stated plainly.
> - **Pricing published** — €249/mo floor, €1,900–2,600 setup with *"your website is inside
>   this,"* €0 commission, Bookings €149 / Ordering €199, 12-month term. €50 Website-Only kept
>   off the table.
> - **Honest-answers FAQ** — the contract question answered in the operator's own words.
> - **Contract row inverted** in the Quandoo table; **Quandoo urgency rewritten** with the real
>   dates and a link to Quandoo's own notice.
> - **Both anonymous testimonials removed**; **60-day guarantee removed**; 7-day guarantee kept
>   and paired with a 0%-commission promise.
> - **Bookings feature list expanded** to what actually ships (reminders/no-shows, waitlist,
>   floor plan, staff logins, guest import, review requests). **SEO reframed** as done-for-you.
> - **"5 working days" → "inside 7 days"** — the inconsistency is gone.
>
> Still open from the list below: **9 (Finnish version)**, **10 (client proof, blocked)**, the
> AI guest-marketing block (GAP 3), the reviews block (GAP 2), and the depth pages
> (`/ordering`, `/quandoo`).

### The original order

1. **Decide the deploy story first.** Merge or discard the root `index.html` / `v2.html` /
   `v3.html` WIP redesign so there is one source of truth, and confirm every edit lands in
   `public/`.
2. **Fix the two false commercial promises first** (§4.0a "no contracts / cancel anytime" and
   §4.0b the hidden setup fee). These are one-paragraph diffs and they are the only items on this
   list where leaving them costs you a deal *after* the prospect is sold.
3. **Run the Quandoo deadline campaign.** 57 days of validated,
   externally-sourced urgency against a whole market that is being forced to switch. Dated copy
   above the fold + a `/quandoo` landing page + the source link + done-for-you migration. Every
   week of delay is inventory that expires (§4.4).
4. **Build the calculator** (§6). This is the operator's priority and it is the page's new
   centrepiece — it carries the pricing story, the ordering story and the Quandoo story in one
   widget, using the owner's own numbers. Static HTML + inline JS, no build step.
5. **Publish the entry price** (§5) — €249/month floor, €1,900–€2,600 setup, €0 commission,
   12-month term. The calculator makes this safe to show: the price never appears without the
   context that beats it. Keep €50 Website-Only off the platform pricing table.
6. **Fix the remaining contradicted claims** (§4, items 1–3, 5–7). Small diffs, immediate
   credibility. Includes removing both anonymous testimonials, pulling the unconfirmed 60-day
   guarantee, keeping and enlarging the 7-day guarantee, and reframing SEO as a done-for-you
   service.
7. **Add the ordering section + `/ordering` page** (§3 GAP 1) around the calculator, with the
   "keep Wolt, own your regulars" framing. Biggest new revenue surface — but it is not
   deadline-bound, which is why Quandoo goes first.
8. **Rewrite the Klar Bookings section** with the real feature set (§3 GAP 4) and add reviews
   (GAP 2) and AI guest marketing (GAP 3) as their own blocks.
9. **Ship a Finnish version** of the home page and the calculator — most Quandoo-refugee searches
   will be in Finnish.
10. *(Blocked)* Client proof strip — waits on a client clearing their name (§3 GAP 5).

**Verification for anyone doing the above:** the changed page renders correctly at
`klarsystems.com` (not just in `public/index.html` source), and every product claim on it maps to
a row in the table in §2 that is marked ✅.

---

## 9. Operator questions — status

**Resolved 2026-08-04:**

- ✅ **Contract** — there *is* a 12-month contract. A client can stop using the service anytime,
  but the commitment stands; genuine circumstances are handled by talking to us. "No contracts /
  cancel anytime" comes off the site. §4.0a
- ✅ **7-Day Delivery Guarantee** — real. Keep and enlarge. §5
- ⚠️ **60-Day Results Guarantee** — operator does not know if it stands. Pulled until someone
  defines "measurable new traffic" and agrees to honour it. §5
- ✅ **Calculator** — build it, per §6: their numbers, setup fee ≈ one month of platform fees,
  website included in that fee. §6

- ✅ **Quandoo shutdown** — verified true and citable (Quandoo's own notice; new reservations end
  **2026-09-30**). Promoted from "risky claim" to the site's most valuable campaign. §4.4
- ✅ **Client names** — not permitted yet. Both anonymous testimonials come out; proof strip
  deferred; ordering copy stays unnamed. §3 GAP 5
- ✅ **Pricing** — answered by `MONEY-MODEL.md`: setup €1,900–2,600, Complete from €249/mo,
  Bookings €149, Ordering €199, usage tiers 300/750/1,500, 12-month term, never a % of sales. §5
- ✅ **SEO/AEO** — sold as a done-for-you service, no implied engine. §4.2

**Still open:**

- **Founding Partner "rate locked permanently"** vs usage-based tiers — which is locked, the tier
  price or the plan price? Blocks publishing the pricing section. §5
- **"We build your restaurant's site before you pay"** — is a real preview-before-deposit flow
  offered, or does the 50% deposit come first? The hero line depends on it. §4.0b
- **Reserve with Google** — advertise now (routes exist) or wait for confirmed partner approval?
- **Publish the usage tiers now** (300/750/1,500), or only the €249 floor until the thresholds
  are validated against 8–12 weeks of live data? The money model marks them 🟡.

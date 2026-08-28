# Google Business Profile — Klar

Everything Google will ask for, already written. Paste from here; nothing below
needs to be composed on the spot.

**Status 2026-08-28:** no profile exists. Klar sells "Google Business profile
setup" to every tenant (`klar-console` → `docs/MONEY-MODEL.md` §2) but never
created its own. The site now carries the structured data a profile is matched
against (`public/index.html`, `ProfessionalService` + `WebSite` JSON-LD); before
2026-08-28 `klarsystems.com` emitted **zero** structured data.

---

## 1. What only the operator can supply

| Field | Why it is not in this file |
|---|---|
| Business name as registered | The registry name decides what Google will verify. Klar trades as **Klar**; if the Y-tunnus record says **Klar Systems**, use that. |
| Street address | Needed for verification even when hidden. Not published anywhere in these repos, deliberately. |
| Phone number | No phone is published on any Klar surface today. Optional in Google; a profile with one converts better. |
| Show address, or hide it | Klar has no walk-in premises → **service-area business**, address hidden. Recommended, but it is a business decision. |

Legal form stays off the public profile: the registered form belongs in
contracts, not on Search. The dead root-level `index.html` in this repo still
says "Klar Systems Oy" — it is not served (live bytes match `public/index.html`)
and was left alone.

---

## 2. The values to paste

**Name:** `Klar` (or the registered name, per §1)

**Primary category:** `Software company`
**Additional categories:** `Internet marketing service`, `Marketing agency`
Type these into Google's category search and pick the closest match it offers —
the list is fixed and it does not accept free text.

**Not `Website designer`.** It was the first recommendation here and it was
wrong: the website is one line item of several, not what Klar is. `VISION.md` §2
puts it plainly — "the website gets us in the door, the recurring system is the
business." A primary category of Website designer files Klar next to web
agencies, competing on page design, and buries ordering, reservations and guest
CRM. It is available as a *secondary* if the website work should still be
findable; that is a positioning call, not a correctness one.

**Service area:** Helsinki, Espoo, Vantaa — then add `Finland` as the outer ring.

**Website:** `https://klarsystems.com/` — plain, no UTM. The URL has to match the
canonical on the page for Google to associate the entity.

**Appointment / booking link:**
`https://calendly.com/lomberg-klarsystems/klar-bookings-free-cost-review`

**Email:** `guidance@klarsystems.com`

**Hours:** Mon–Fri 09:00–17:00. (An empty hours block reads as "unknown" and
suppresses the profile in some surfaces; "open 24 hours" is worse — it invites
calls nobody answers.)

**Attributes to switch on:** *Online appointments*, *Online estimates*,
*Identifies as small business*.

### Description — English (498 chars, limit 750)

```
Klar is the independent restaurant's own system: online ordering, table reservations, a guest list the restaurant owns, and the website it all runs on — together, on one flat monthly fee. The price does not move with sales. No commission, nothing per order, nothing per cover. Every order, booking and guest detail belongs to the restaurant, not to a platform. We build the system, claim and maintain the restaurant's Google and Apple profiles, and run the whole thing so the owner doesn't have to.
```

### Description — Finnish (511 chars, limit 750)

```
Klar on itsenäisen ravintolan oma järjestelmä: verkkotilaukset, pöytävaraukset, oma asiakasrekisteri ja verkkosivu, jolla kaikki toimii — yhdessä, saman kiinteän kuukausimaksun sisällä. Hinta ei liiku myynnin mukana. Ei komissiota, ei maksua tilausta kohden eikä asiakasta kohden. Jokainen tilaus, varaus ja vieraan tieto kuuluu ravintolalle, ei alustalle. Me rakennamme järjestelmän, rekisteröimme ja ylläpidämme ravintolan Google- ja Apple-profiilit ja pyöritämme kokonaisuuden niin, ettei omistajan tarvitse.
```

Neither version carries a price or a URL: Google's description guidelines refuse
URLs and treat price and offer language as promotional. Prices go in Services
(§3), where they are allowed.

**One claim in this copy is a promise, not a record.** "Claim and maintain the
restaurant's Google and Apple profiles" is the operator's wording and it ships
as written. Google is already sold — `MONEY-MODEL.md` §2 bills "Google Business
profile setup" in every tier. **Apple is not.** `mobal-competitor-read-2026-08-26.md`
§6 rules Apple Business Connect **"DEFER, not take"**, and `WOLT-DISPLACEMENT.md`
§5b calls that shape "not a task" at this volume. Nothing in the repo records an
Apple profile claimed for any tenant. Claiming one by hand is free and takes
minutes — the ruling was against building the *sync*, not against doing it — so
the sentence is deliverable. It just becomes a per-tenant delivery obligation
from the moment it is published.

### Services — name, then the description Google shows

| Service | Description | Price shown |
|---|---|---|
| Klar Complete | Website, ordering, bookings, guest CRM and SEO together. 0% commission, no per-order or per-cover fee. | From €249/month + VAT, €1,900–€2,600 setup |
| Online ordering | Take orders on your own site at 0% commission. Your website is included. | From €199/month + VAT |
| Table reservations | Your own booking system, on your own site. No per-cover fee. Your website is included. | From €149/month + VAT |
| Guest CRM | Every order and booking builds a guest list the restaurant owns, not the platform. | Included in Klar Complete |
| Restaurant SEO and AI search | Technical SEO and structured data so the restaurant is found on Google, and answered correctly by AI assistants. | Included in every plan |
| Google and Apple business profiles | We claim and verify the restaurant's Google Business Profile and Apple Business Connect listing, and keep the hours, menu link and photos accurate. | Included |
| Restaurant website | Your own website, hosted and managed. Included in every other plan; available on its own. | From €49/month + VAT, €1,490 setup |
| Google and Meta ad management | Campaign setup and management. Ad spend billed separately. | Quoted |

Google shows services in the order they are added, so the order above is the
order to add them. The website sits sixth deliberately — it is included in every
other plan rather than being the thing on sale.

Every figure above is the live price on `klarsystems.com/#pricing` as of
2026-08-28. If the page changes, this table changes with it, or the profile
becomes a second source of truth that contradicts the site.

### Photos — already on the server, correct dimensions

| Slot | File | Size |
|---|---|---|
| Logo (square, min 250×250) | `public/logos/klar-logo.png` → https://klarsystems.com/logos/klar-logo.png | 512×512 PNG |
| Cover (16:9, min 480×270) | `public/media/hero-poster.jpg` → https://klarsystems.com/media/hero-poster.jpg | 1920×1080 JPEG |

Google will not accept the SVG logos. Download the two files above and upload
them from disk.

---

## 3. First post and Q&A, worth doing on day one

An empty profile ranks worse than a filled one. Two things take five minutes:

**Post (What's new):** "Restaurants in Helsinki pay up to 30% of an order to a
delivery app and a fee per cover to a booking platform. Klar replaces both with
your own ordering, your own reservations and a guest list you keep, on one flat
monthly fee. Live in seven days." → button *Book*, pointing at the Calendly link.

**Q&A, asked and answered by the owner account:**
- *"Do you take a commission on orders?"* → "No. Klar is a flat monthly fee. 0%
  of your sales, €0 per order, €0 per cover."
- *"How long does it take?"* → "Most restaurants are live in seven days."
- *"What happens if I leave?"* → "You keep the website, the domain and your
  guest data."

---

## 4. What was shipped on the site for this

`public/index.html` head now carries one `application/ld+json` block:

- `ProfessionalService` (`#klar`) — name, alternateName, url, email, logo,
  image, `PostalAddress` (Helsinki, FI), `areaServed` Finland, `knowsAbout`, and
  an `OfferCatalog` with the four live plans and their prices.
- `WebSite` (`#website`) — publisher points at `#klar`.

No `sameAs` yet: Klar has no verified social profiles, and inventing them is
worse than omitting the field. Once the Business Profile is verified, its Maps
URL goes into `sameAs` and `hasMap` — that is the one edit still owed here.

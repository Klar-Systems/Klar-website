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

### Description — English (641 chars, limit 750)

```
Klar is the independent restaurant's own system: online ordering, table reservations, a guest list the restaurant owns, and the website it all runs on, together on one flat monthly fee. The price does not move with sales. No commission, nothing per order, nothing per cover. Delivery apps take a cut of every order and booking platforms charge for every guest who sits down, and both keep the customer data. With Klar the orders, the bookings and the guest details belong to the restaurant. We set the system up, keep the restaurant findable on Google and in AI search, and look after it every month. Most restaurants are live in seven days.
```

### Description — Finnish (702 chars, limit 750)

```
Klar on itsenäisen ravintolan oma järjestelmä: verkkotilaukset, pöytävaraukset, oma asiakasrekisteri ja verkkosivu, jolla kaikki toimii, saman kiinteän kuukausimaksun sisällä. Hinta ei liiku myynnin mukana. Ei komissiota, ei maksua tilausta kohden eikä asiakasta kohden. Ruokalähettisovellukset ottavat osuuden jokaisesta tilauksesta ja varausalustat veloittavat jokaisesta pöytään istuvasta vieraasta, ja molemmat pitävät asiakastiedot itsellään. Klarissa tilaukset, varaukset ja vieraiden tiedot kuuluvat ravintolalle. Otamme järjestelmän käyttöön, pidämme ravintolan löydettävänä Googlessa ja tekoälyhauissa ja huolehdimme siitä joka kuukausi. Useimmat ravintolat ovat pystyssä seitsemässä päivässä.
```

Neither version carries a price or a URL: Google's description guidelines refuse
URLs and treat price and offer language as promotional. Prices go in Services
(§3), where they are allowed.

### Services — name, then the description Google shows

| Service | Description | Price shown |
|---|---|---|
| Klar Complete | Website, ordering, bookings, guest CRM and SEO together. 0% commission, no per-order or per-cover fee. | From €249/month + VAT, €1,900–€2,600 setup |
| Online ordering | Take orders on your own site at 0% commission. Your website is included. | From €199/month + VAT |
| Table reservations | Your own booking system, on your own site. No per-cover fee. Your website is included. | From €149/month + VAT |
| Guest CRM | Every order and booking builds a guest list the restaurant owns, not the platform. | Included in Klar Complete |
| Restaurant SEO and AI search | Technical SEO and structured data so the restaurant is found on Google, and answered correctly by AI assistants. | Included in every plan |
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

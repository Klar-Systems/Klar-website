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

**Primary category:** `Website designer`
**Additional categories:** `Software company`, `Marketing agency`,
`Internet marketing service`
Type these into Google's category search and pick the closest match it offers —
the list is fixed and it does not accept free text.

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
Klar builds and runs the digital side of independent restaurants in Finland: your own website, your own online ordering and your own table reservations, on one flat monthly fee and no commission on your sales. Delivery apps take a cut of every order and booking platforms charge per cover. Klar takes neither, and your guest data stays yours. We design and build the site, set up ordering and bookings, keep the restaurant findable on Google and in AI search, and look after it every month. Most restaurants are live in seven days. If you ever leave, you keep the website, the domain and your data. Based in Helsinki, serving all of Finland.
```

### Description — Finnish (675 chars, limit 750)

```
Klar rakentaa ja pyörittää itsenäisten ravintoloiden digipuolen Suomessa: oman verkkosivun, oman verkkotilauksen ja oman pöytävarausjärjestelmän, yhdellä kiinteällä kuukausihinnalla ja ilman komissiota myynnistäsi. Ruokalähettisovellukset ottavat osuuden jokaisesta tilauksesta ja varausalustat veloittavat per asiakas. Klar ei ota kumpaakaan, ja asiakastietosi pysyvät sinun. Suunnittelemme ja rakennamme sivuston, otamme käyttöön tilaukset ja varaukset, pidämme ravintolan löydettävänä Googlessa ja tekoälyhauissa, ja huolehdimme siitä joka kuukausi. Useimmat ravintolat ovat pystyssä seitsemässä päivässä. Jos joskus lähdet, saat pitää sivuston, verkkotunnuksen ja datasi.
```

Neither version carries a price or a URL: Google's description guidelines refuse
URLs and treat price and offer language as promotional. Prices go in Services
(§3), where they are allowed.

### Services — name, then the description Google shows

| Service | Description | Price shown |
|---|---|---|
| Restaurant website | Your own website, designed and built for the restaurant, hosted and managed. Kept findable on Google and in AI search. | From €49/month + VAT, €1,490 setup |
| Online ordering | Take orders on your own site at 0% commission. Your website is included. | From €199/month + VAT |
| Table reservations | Your own booking system, on your own site. No per-cover fee. Your website is included. | From €149/month + VAT |
| Klar Complete | Website, ordering, bookings, guest CRM and SEO together. 0% commission, no per-order or per-cover fee. | From €249/month + VAT, €1,900–€2,600 setup |
| Restaurant SEO and AI search | Technical SEO and structured data so the restaurant is found on Google, and answered correctly by AI assistants. | Included in every plan |
| Google and Meta ad management | Campaign setup and management. Ad spend billed separately. | Quoted |

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
your own website, your own ordering and your own bookings at 0% commission, live
in seven days." → button *Book*, pointing at the Calendly link.

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

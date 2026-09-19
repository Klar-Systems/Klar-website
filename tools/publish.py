"""Publish redesign/ onto the live URL structure in public/.

WHY A SCRIPT AND NOT A MOVE. `redesign/` is flat files — `hinnat.html`,
`en-pricing.html` — and klarsystems.com is directory URLs: /hinnat/, /pricing/.
Those URLs are indexed and printed on proposals, so they are the fixed points;
the filenames are not. This maps one onto the other, rewrites every internal
link as it copies, and re-stamps the asset cache. Running it twice produces the
same tree.

WHAT IT DOES NOT TOUCH. /privacy/, /terms/, /proposals/, /logos/, /media/,
styles.css and site.js belong to the old site and are still linked or still
serving customers. The redesign's own assets go to /r/ precisely so that
`site.js` cannot collide with the old `site.js`.

  python3 tools/publish.py            # dry run: every file it would write
  python3 tools/publish.py --apply
"""

import json
import os
import re
import shutil
import sys
import time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "redesign")
DST = os.path.join(ROOT, "public")
APPLY = "--apply" in sys.argv

# redesign filename -> published path. Order matters for link rewriting: the
# English names are replaced first, because "about.html" is a substring of
# "en-about.html" and a careless pass would turn the latter into "en-/meista/".
PAGES = [
    ("en-index.html", ""),
    ("en-services.html", "what-we-provide"),
    ("en-pricing.html", "pricing"),
    ("en-about.html", "about"),
    ("en-contact.html", "contact"),
    ("index.html", "fi"),
    ("palvelut.html", "palvelut"),
    ("hinnat.html", "hinnat"),
    ("about.html", "meista"),
    ("yhteystiedot.html", "yhteystiedot"),
    ("kuvat.html", "kuvat"),
]

SHARED = ["site.css", "site.js", "mesh.js"]

# Retired surfaces. The page stays as a redirect rather than 404 — the URLs are
# in Google's index and on printed material, and a redirect keeps that traffic.
REDIRECTS = {
    "founding": ("/pricing/", "Klar Partnership ended", "This offer is no longer sold."),
    "calls": ("/", "Klar Calls ended", "Klar Calls is no longer offered."),
    "calculator": ("/pricing/", "Moved", "The calculator has been replaced by the pricing page."),
}

STAMP = str(int(time.time()))


def url_of(name: str) -> str:
    for page, path in PAGES:
        if page == name:
            return "/" if path == "" else f"/{path}/"
    raise KeyError(name)


def rewrite(html: str) -> str:
    """Flat filenames become directory URLs; shared assets move under /r/."""
    for page, _ in PAGES:
        html = html.replace(f'href="{page}"', f'href="{url_of(page)}"')
    for asset in SHARED:
        html = re.sub(rf'(href|src)="{asset}(\?v=\d+)?"', rf'\1="/r/{asset}?v={STAMP}"', html)
    html = re.sub(r'(href|src|poster)="img/', r'\1="/r/img/', html)
    return html


def referenced_images(pages: list[str]) -> set[str]:
    """Only the images the pages actually use. redesign/img also holds the
    rejected pools, which are tens of megabytes and must never be published."""
    used: set[str] = set()
    for html in pages:
        for m in re.finditer(r'(?:href|src|poster)="/r/img/([^"?]+)', html):
            used.add(m.group(1))
    return used


SITE = "https://klarsystems.com"


def seo_errors(page: str, html: str) -> list[str]:
    """The head this site is found by. A rewrite of these pages once replaced
    every one of them with a bare <title>, and it went live and stayed live:
    no description, no canonical, no Open Graph, no structured data, on every
    page except the two the rewrite never touched. Publishing is the last
    moment that is catchable, so it is caught here rather than remembered."""
    out = []
    url = SITE + url_of(page)
    if not re.search(r"<title>\s*\S.*?</title>", html, re.S):
        out.append("no <title>")
    if not re.search(r'<meta name="description" content="[^"]{20,}"', html):
        out.append("no meta description (or shorter than 20 characters)")
    canonical = re.search(r'<link rel="canonical" href="([^"]+)"', html)
    if not canonical:
        out.append("no canonical link")
    elif canonical.group(1) != url:
        out.append(f"canonical is {canonical.group(1)}, but this page publishes at {url}")
    for prop in ("og:title", "og:description", "og:url", "og:image"):
        if f'property="{prop}"' not in html:
            out.append(f"no {prop}")
    blocks = re.findall(r'<script type="application/ld\+json">(.*?)</script>', html, re.S)
    if not blocks:
        out.append("no schema.org JSON-LD")
    for block in blocks:
        try:
            json.loads(block)
        except ValueError as exc:
            out.append(f"JSON-LD does not parse: {exc}")
    return out


def main() -> None:
    written: list[str] = []
    rendered: dict[str, str] = {}
    seo_failures: list[str] = []

    for page, path in PAGES:
        src = os.path.join(SRC, page)
        if not os.path.exists(src):
            raise SystemExit(f"missing source page: {page}")
        html = rewrite(open(src, encoding="utf-8").read())
        seo_failures += [f"{page}: {problem}" for problem in seo_errors(page, html)]
        target = os.path.join(DST, path, "index.html") if path else os.path.join(DST, "index.html")
        rendered[target] = html
        written.append(target)

    if seo_failures:
        raise SystemExit(
            "REFUSED: the head these pages are found by is incomplete.\n  "
            + "\n  ".join(seo_failures)
            + "\n\nFix the source page in redesign/ and publish again. Nothing was written."
        )

    images = referenced_images(list(rendered.values()))
    for rel in sorted(images):
        written.append(os.path.join(DST, "r", "img", rel))
    for asset in SHARED:
        written.append(os.path.join(DST, "r", asset))
    for slug in REDIRECTS:
        written.append(os.path.join(DST, slug, "index.html"))

    for w in written:
        print("  " + os.path.relpath(w, ROOT))
    print(f"\n{len(written)} file(s), asset stamp v={STAMP}")

    if not APPLY:
        print("Dry run. Re-run with --apply to write.\n")
        return

    for target, html in rendered.items():
        os.makedirs(os.path.dirname(target), exist_ok=True)
        open(target, "w", encoding="utf-8").write(html)

    for asset in SHARED:
        os.makedirs(os.path.join(DST, "r"), exist_ok=True)
        shutil.copy2(os.path.join(SRC, asset), os.path.join(DST, "r", asset))

    for rel in sorted(images):
        dst = os.path.join(DST, "r", "img", rel)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        shutil.copy2(os.path.join(SRC, "img", rel), dst)

    for slug, (to, title, line) in REDIRECTS.items():
        os.makedirs(os.path.join(DST, slug), exist_ok=True)
        open(os.path.join(DST, slug, "index.html"), "w", encoding="utf-8").write(
            "<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"utf-8\">\n"
            f"<meta http-equiv=\"refresh\" content=\"0; url={to}\">\n"
            "<meta name=\"robots\" content=\"noindex\">\n"
            f"<link rel=\"canonical\" href=\"{to}\"><title>{title}</title></head>\n"
            "<body style=\"font:16px/1.5 system-ui;padding:40px\">"
            f"{line} <a href=\"{to}\">Continue →</a></body></html>\n"
        )

    print("Written.\n")


if __name__ == "__main__":
    main()

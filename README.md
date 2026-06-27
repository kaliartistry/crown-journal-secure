# Crown Journal

Static GitHub Pages site for The Crown Journal by Kali Artistry, starting with Kali McCarthy's sports-culture essay:

**Heavy Is The Crown. Brunson Wanted The Smoke.**

Production URL:

https://journal.kaliartistry.com/

Launch article:

https://journal.kaliartistry.com/heavy-is-the-crown-brunson-wanted-the-smoke/

## Publishing

- Host: GitHub Pages
- Custom domain: `journal.kaliartistry.com`
- DNS target: `kaliartistry.github.io`
- Journal homepage: `/`
- Main article route: `/heavy-is-the-crown-brunson-wanted-the-smoke/`
- Hero image: original generated editorial visual, no NBA/Knicks logos, no player likeness, no official uniform marks
- Analytics: GA4 measurement ID `G-VDK00FP55M`, matching Kali Artistry's Zenfolio tracking
- AI-readable guide: `llms.txt`
- Sitemap: `sitemap.xml`

## Local Preview

Use any static server from the repo root:

```powershell
npx serve . -l 4173
```

Then open:

```text
http://localhost:4173/
http://localhost:4173/heavy-is-the-crown-brunson-wanted-the-smoke/
```

## Distribution

Launch assets live in `distribution/`.

Use `distribution/tracked-links.md` for UTM-tagged links. Keep the clean production URL as the canonical URL.

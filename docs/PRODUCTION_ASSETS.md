# Production Assets

Required static assets before full production launch. Place all files in `/public`.

## Open Graph / Social Share Image

| Property | Value |
|----------|-------|
| **Path** | `/public/og/structonix-og.jpg` |
| **URL** | `https://structonixsistem.com/og/structonix-og.jpg` |
| **Size** | **1200 × 630 px** |
| **Format** | JPG or PNG |
| **Max file size** | ≤ 500 KB recommended |

### Design guidelines

- Dark blue background (`#0F016A`) matching site header/footer
- White Structonix logo (from `/public/logo/StructonixLogoWhite.jpg`)
- Company name: **STRUCTONIX** + **SISTEM GLOBAL, S.L.**
- Optional tagline: engineering, architecture and construction
- Montserrat typography
- Safe zone: keep text/logo 60 px from edges (platforms may crop)

Configured in `config/site.ts` → `assets.ogImage`.

---

## Favicons

| File | Size | Path |
|------|------|------|
| favicon.ico | 32×32 (multi-size ICO) | `/public/favicon.ico` |
| favicon-32x32.png | 32×32 px | `/public/favicon-32x32.png` |
| favicon-192x192.png | 192×192 px | `/public/favicon-192x192.png` |
| apple-touch-icon.png | 180×180 px | `/public/apple-touch-icon.png` |

### Design guidelines

- Use white Structonix “S” logo on `#0F016A` background
- Export square PNGs; convert to ICO for `favicon.ico`
- Test on Chrome, Safari, and mobile home screen

Configured in `src/app/layout.tsx` metadata `icons`.

---

## Status

| Asset | Status |
|-------|--------|
| `og/structonix-og.jpg` | **TODO — not yet added** |
| `favicon.ico` | **TODO — not yet added** |
| `favicon-32x32.png` | **TODO — not yet added** |
| `favicon-192x192.png` | **TODO — not yet added** |
| `apple-touch-icon.png` | **TODO — not yet added** |

Site will reference these paths; add files before launch for correct social previews and browser icons.

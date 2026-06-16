# Structonix Blog — Notion CMS

The blog is integrated into the main Structonix site. Content is managed in Notion and rendered at:

| Locale | Index | Article |
|--------|-------|---------|
| ES (default) | `/blog` | `/blog/[slug]` |
| EN | `/en/blog` | `/en/blog/[slug]` |
| RU | `/ru/blog` | `/ru/blog/[slug]` |

Architecture: **one Notion database row per locale**, linked by a shared `translationGroup`. Each locale has its own slug, title, excerpt, SEO fields, and page body. There is no automatic translation.

See also: `config/blog.ts` (property names), `src/lib/notion.ts` (data layer).

---

## Notion integration setup

### 1. Create the integration

1. Open [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Click **New integration**
3. Name it (e.g. `Structonix Blog`)
4. Copy the **Internal Integration Secret** → use as `NOTION_API_KEY`

### 2. Create the database

1. Create a new **full-page database** in Notion (e.g. `Structonix Blog`)
2. Add all properties listed in [Database schema](#database-schema) below
3. Property names must match exactly (configured in `config/blog.ts`)

### 3. Connect the integration

1. Open the database page
2. Click **⋯** (top right) → **Connections**
3. Add your `Structonix Blog` integration

Without this step, API requests return `404` or `403`.

### 4. Get the database ID

Open the database URL:

```
https://www.notion.so/yourworkspace/abc123def4567890abc123def4567890?v=...
```

The 32-character segment is `NOTION_DATABASE_ID` (hyphens optional).

### 5. Set environment variables

Copy `.env.example` to `.env.local` for local development, or set variables in the Hostinger panel for production:

```env
NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_DATABASE_ID=abc123def4567890abc123def4567890
```

Redeploy after adding credentials. The site builds successfully even when these variables are missing (blog shows an empty state).

---

## Database schema

| Property | Notion type | Required | Description |
|----------|-------------|----------|-------------|
| `title` | **Title** | Yes | Article headline |
| `slug` | **Text** | Yes | URL slug, unique per locale |
| `excerpt` | **Text** | Yes | Card summary; SEO description fallback |
| `seoTitle` | **Text** | No | Meta / Open Graph title override |
| `seoDescription` | **Text** | No | Meta / Open Graph description override |
| `coverImage` | **URL** or **Files** | No | Hero and social preview image |
| `publishedDate` | **Date** | Yes | Sort order and sitemap `lastModified` |
| `published` | **Checkbox** | Yes | Only `true` rows appear on the site |
| `locale` | **Select** | Yes | `es`, `en`, or `ru` (lowercase) |
| `translationGroup` | **Text** | Yes* | Shared ID linking translated versions |
| `author` | **Text** | No | Byline |
| `tags` | **Multi-select** | No | Categories / future filtering |
| `featured` | **Checkbox** | No | Surfaces in the featured section on page 1 |

\*Required when publishing linked ES/EN/RU versions.

**Page body:** write article content on the Notion page itself (paragraphs, headings, lists, images, quotes, code, etc.).

### Example — one article, three rows

| Field | ES | EN | RU |
|-------|----|----|-----|
| `translationGroup` | `building-license-malaga` | `building-license-malaga` | `building-license-malaga` |
| `locale` | `es` | `en` | `ru` |
| `slug` | `como-obtener-licencia-de-obras-en-malaga` | `how-to-obtain-a-building-license-in-malaga` | `kak-poluchit-razreshenie-na-stroitelstvo-v-malage` |
| `published` | ✓ | ✓ | ✓ |

Resulting URLs:

- `https://structonixsistem.com/blog/como-obtener-licencia-de-obras-en-malaga`
- `https://structonixsistem.com/en/blog/how-to-obtain-a-building-license-in-malaga`
- `https://structonixsistem.com/ru/blog/kak-poluchit-razreshenie-na-stroitelstvo-v-malage`

---

## translationGroup workflow

`translationGroup` is a stable identifier shared by all locale rows of the same article.

**Rules:**

1. Use one group per article topic, e.g. `building-license-malaga`
2. Use lowercase, hyphens, no spaces
3. Set the **same value** on ES, EN, and RU rows
4. Do **not** change it after publishing (breaks hreflang history)
5. Slugs remain **different** per locale — only the group is shared

**How the site uses it:**

- `getPostTranslationAlternates()` queries all published rows with the same `translationGroup`
- hreflang tags are built with each locale’s own slug
- Related posts prefer same-group articles, then shared tags

If `translationGroup` is empty, the article is treated as standalone (no cross-locale alternates).

---

## Publishing ES / EN / RU articles

### New article

1. **Pick a `translationGroup` ID** (e.g. `urbanizacion-valencia-2026`)

2. **Create the ES row**
   - `locale` = `es`
   - Write Spanish `title`, `slug`, `excerpt`, optional `seoTitle` / `seoDescription`
   - Set `publishedDate`, leave `published` unchecked
   - Write body content on the Notion page

3. **Create the EN row** (new database entry, not a duplicate of ES)
   - Same `translationGroup`
   - `locale` = `en`, English slug/title/excerpt/SEO/body
   - Manually translated content only

4. **Create the RU row** — same pattern with `locale` = `ru`

5. **Pre-publish checklist (each row)**
   - [ ] `slug` is URL-safe (lowercase, hyphens, no spaces)
   - [ ] `slug` is unique within that locale
   - [ ] `translationGroup` matches sibling rows
   - [ ] `locale` is correct
   - [ ] Body content is complete
   - [ ] `coverImage` set (recommended for social previews)

6. **Publish**
   - Check `published` on each row when ready
   - Locales can go live independently (ES only, then EN/RU later)
   - hreflang includes only published locales

### Update or unpublish

- Edit in Notion → changes appear after ISR revalidation (see below)
- Uncheck `published` → article removed from index, sitemap, and direct URLs return 404

---

## Sitemap updates

Sitemap: `/sitemap.xml` (`src/app/sitemap.ts`)

**Static entries (unchanged):** all existing routes including `/blog`, `/en/blog`, `/ru/blog`.

**Dynamic entries:** each published article is added per locale:

```
https://structonixsistem.com/blog/{es-slug}
https://structonixsistem.com/en/blog/{en-slug}
https://structonixsistem.com/ru/blog/{ru-slug}
```

- `lastModified` comes from `publishedDate`
- `changeFrequency`: `weekly`
- `priority`: `0.7`

If Notion is not configured or the API fails, sitemap generation still succeeds — blog article URLs are simply omitted (index URLs remain).

---

## ISR (Incremental Static Regeneration)

Blog routes use `export const revalidate = 3600` (1 hour).

| Route | Behavior |
|-------|----------|
| `/[locale]/blog` | Server-rendered; revalidates every hour |
| `/[locale]/blog/[slug]` | Pre-rendered per locale + slug at build; revalidates every hour |

**What this means:**

- New or updated Notion content appears within ~1 hour without redeploying
- A fresh deploy picks up content immediately at build time (when Notion is configured)
- `generateStaticParams` pre-builds only valid locale + slug pairs from Notion

Revalidation interval is defined in page files (`3600` seconds). The shared constant in `config/blog.ts` documents the intended value.

---

## Common mistakes

| Mistake | Symptom | Fix |
|---------|---------|-----|
| Integration not connected to database | API 404/403, empty blog | Connect integration under **Connections** |
| Wrong property names | Rows ignored | Match names in `config/blog.ts` exactly |
| `locale` not lowercase | Row filtered out | Use `es`, `en`, `ru` |
| Same slug in two rows of same locale | Unpredictable results | One slug per locale only |
| Missing `translationGroup` on translations | No hreflang cross-links | Set same group on all locale rows |
| `published` unchecked | Article invisible | Check `published` when going live |
| Changed `translationGroup` after publish | Broken hreflang | Keep group stable; create new group for new article |
| Slug with spaces or uppercase | Broken URLs | Use lowercase hyphenated slugs |
| Only ES row published | EN/RU 404 | Publish each locale row separately |

---

## Troubleshooting

### Blog index is empty but Notion has articles

1. Confirm `NOTION_API_KEY` and `NOTION_DATABASE_ID` are set in the deployment environment
2. Confirm integration is connected to the database
3. Confirm rows have `published = true`
4. Confirm `locale` matches the page you are viewing (`es` / `en` / `ru`)
5. Wait up to 1 hour for ISR, or redeploy to force refresh

### Article URL returns 404

1. Check `slug` matches the URL exactly
2. Check `locale` on the row matches the URL prefix (`/blog` = es, `/en/blog` = en)
3. Check `published = true`
4. Verify slug exists for that locale (slugs are not shared across languages)

### hreflang missing EN or RU

1. Confirm sibling rows exist with the same `translationGroup`
2. Confirm sibling rows have `published = true`
3. Confirm `translationGroup` text matches exactly (case-sensitive)

### Images not loading

1. Use a full HTTPS URL in `coverImage`
2. Notion-hosted file URLs are allowed via `next.config.ts` remote patterns
3. Expired Notion file URLs may need re-upload

### Build fails

The build must pass without Notion credentials. If it fails:

1. Check for hardcoded API calls outside `isNotionConfigured()` guards
2. Run `npm run build` locally without `NOTION_*` variables

### Sitemap missing article URLs

1. Confirm Notion credentials are set in the **build/runtime** environment
2. Confirm articles are published
3. Check server logs for `[sitemap] Failed to load blog entries`

---

## Code reference

| File | Purpose |
|------|---------|
| `src/lib/notion.ts` | `getAllPosts`, `getPostBySlug`, `getFeaturedPosts`, translation alternates |
| `src/lib/blog-metadata.ts` | Article SEO, canonical, hreflang, Open Graph |
| `src/app/[locale]/blog/page.tsx` | Blog index |
| `src/app/[locale]/blog/[slug]/page.tsx` | Article detail |
| `src/app/sitemap.ts` | Sitemap including blog URLs |
| `config/navigation.ts` | Blog link in main navigation |
| `config/blog.ts` | Property names, pagination, featured limit |

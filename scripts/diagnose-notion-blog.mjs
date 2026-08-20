/**
 * Safe Notion blog diagnostic — logs counts and property TYPES only.
 * Never prints API keys, tokens, or full secrets.
 *
 * Usage: node --env-file=.env.local scripts/diagnose-notion-blog.mjs
 */
import { Client } from "@notionhq/client";

const apiKey = process.env.NOTION_API_KEY?.trim();
const databaseId = process.env.NOTION_DATABASE_ID?.trim();

function maskId(id) {
  if (!id) return "(missing)";
  if (id.length < 8) return `(len=${id.length})`;
  return `${id.slice(0, 4)}…${id.slice(-4)} (len=${id.length})`;
}

if (!apiKey || !databaseId) {
  console.log("NOTION_CONFIGURED: false");
  console.log("hasApiKey:", Boolean(apiKey), "hasDatabaseId:", Boolean(databaseId));
  process.exit(1);
}

console.log("NOTION_CONFIGURED: true");
console.log("databaseId:", maskId(databaseId));

const notion = new Client({ auth: apiKey });

async function queryAll(filter) {
  const pages = [];
  let cursor;
  do {
    const response = await notion.databases.query({
      database_id: databaseId,
      ...(filter ? { filter } : {}),
      start_cursor: cursor,
      page_size: 100,
    });
    for (const result of response.results) {
      if (result.object === "page") pages.push(result);
    }
    cursor = response.has_more ? response.next_cursor ?? undefined : undefined;
  } while (cursor);
  return pages;
}

function propType(page, name) {
  const prop = page.properties?.[name];
  return prop?.type ?? "(missing)";
}

function getSelect(page, name) {
  const prop = page.properties?.[name];
  if (prop?.type === "select") return prop.select?.name ?? null;
  if (prop?.type === "status") return prop.status?.name ?? null;
  if (prop?.type === "rich_text") {
    return prop.rich_text?.map((t) => t.plain_text).join("").trim() || null;
  }
  return null;
}

function getCheckbox(page, name) {
  const prop = page.properties?.[name];
  if (prop?.type === "checkbox") return prop.checkbox;
  return null;
}

function getRichText(page, name) {
  const prop = page.properties?.[name];
  if (prop?.type === "rich_text") {
    return prop.rich_text?.map((t) => t.plain_text).join("").trim() || "";
  }
  if (prop?.type === "title") {
    return prop.title?.map((t) => t.plain_text).join("").trim() || "";
  }
  if (prop?.type === "url") return prop.url || "";
  if (prop?.type === "formula" && prop.formula?.type === "string") {
    return prop.formula.string || "";
  }
  return "";
}

function getTitle(page) {
  for (const value of Object.values(page.properties || {})) {
    if (value?.type === "title") {
      return value.title?.map((t) => t.plain_text).join("") || "Untitled";
    }
  }
  return "Untitled";
}

function getDate(page, name) {
  const prop = page.properties?.[name];
  if (prop?.type === "date") return prop.date?.start ?? null;
  return null;
}

const CYRILLIC_TO_LATIN = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "e",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "sch",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",
};

/** Mirrors src/lib/blog-utils.ts slugifyBlogTitle for post-fix verification. */
function slugifyBlogTitle(title) {
  const lowered = title.trim().toLowerCase();
  let transliterated = "";
  for (const char of lowered) {
    if (CYRILLIC_TO_LATIN[char] !== undefined) {
      transliterated += CYRILLIC_TO_LATIN[char];
      continue;
    }
    transliterated += char;
  }
  return transliterated
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 80);
}

function resolveSlug(page) {
  const explicit = getRichText(page, "slug");
  if (explicit) return explicit;
  const fromTitle = slugifyBlogTitle(getTitle(page));
  if (fromTitle) return fromTitle;
  return `post-${page.id.replace(/-/g, "").slice(0, 12)}`;
}

try {
  const db = await notion.databases.retrieve({ database_id: databaseId });
  console.log("\n=== SCHEMA (property name → type) ===");
  const schema = db.properties || {};
  for (const [name, def] of Object.entries(schema)) {
    const extra =
      def.type === "select" && def.select?.options
        ? ` options=[${def.select.options.map((o) => o.name).join(", ")}]`
        : "";
    console.log(`  ${name}: ${def.type}${extra}`);
  }

  const all = await queryAll();
  console.log("\n=== STEP A: raw Notion pages ===");
  console.log("Total Notion records:", all.length);

  if (all[0]) {
    console.log("\n=== Sample property types from first page ===");
    for (const key of [
      "title",
      "slug",
      "locale",
      "published",
      "publishedDate",
      "featured",
      "coverImage",
      "excerpt",
      "seoDescription",
      "translationGroup",
      "author",
      "tags",
    ]) {
      console.log(`  ${key}: ${propType(all[0], key)}`);
    }
  }

  const rows = all.map((page) => {
    const localeRaw = getSelect(page, "locale");
    const locale = localeRaw?.trim().toLowerCase() ?? null;
    const published = getCheckbox(page, "published");
    const slugExplicit = getRichText(page, "slug");
    const slugResolved = resolveSlug(page);
    const title = getTitle(page);
    const publishedDate = getDate(page, "publishedDate");
    const featured = getCheckbox(page, "featured");
    const slugType = propType(page, "slug");
    const localeType = propType(page, "locale");

    const wouldMap = Boolean(
      locale &&
        ["es", "en", "ru"].includes(locale) &&
        slugResolved &&
        published === true,
    );

    return {
      id: page.id.slice(0, 8),
      title: title.slice(0, 60),
      localeRaw,
      locale,
      published,
      publishedDate,
      featured,
      slug: slugExplicit ? slugExplicit.slice(0, 40) : `(derived:${slugResolved.slice(0, 32)})`,
      slugResolved: slugResolved.slice(0, 50),
      slugType,
      localeType,
      wouldMap,
      skipReason: !published
        ? "not-published"
        : !locale
          ? "no-locale"
          : !["es", "en", "ru"].includes(locale)
            ? `bad-locale:${locale}`
            : !slugResolved
              ? "no-slug"
              : null,
    };
  });

  console.log("\n=== STEP B/C/D: mapped diagnostics ===");
  console.log("Published true:", rows.filter((r) => r.published === true).length);
  console.log("Would pass mapper:", rows.filter((r) => r.wouldMap).length);
  for (const loc of ["es", "en", "ru"]) {
    const publishedLoc = rows.filter(
      (r) => r.published === true && r.locale === loc,
    );
    const mappedLoc = rows.filter((r) => r.wouldMap && r.locale === loc);
    console.log(
      `${loc.toUpperCase()} published: ${publishedLoc.length}, wouldRender: ${mappedLoc.length}`,
    );
  }

  console.log("\n=== SKIPPED / PROBLEM ROWS ===");
  const problems = rows.filter((r) => r.published === true && !r.wouldMap);
  if (problems.length === 0) {
    console.log("(none — all published rows would map)");
  } else {
    for (const row of problems) {
      console.log(
        JSON.stringify({
          id: row.id,
          title: row.title,
          skipReason: row.skipReason,
          localeRaw: row.localeRaw,
          slug: row.slug,
          slugType: row.slugType,
          localeType: row.localeType,
          publishedDate: row.publishedDate,
        }),
      );
    }
  }

  console.log("\n=== ALL PUBLISHED ROWS (safe summary) ===");
  for (const row of rows.filter((r) => r.published === true)) {
    console.log(
      JSON.stringify({
        title: row.title,
        locale: row.locale,
        slug: row.slug,
        publishedDate: row.publishedDate,
        featured: row.featured,
        wouldMap: row.wouldMap,
        skipReason: row.skipReason,
      }),
    );
  }
} catch (error) {
  console.error("DIAGNOSTIC_FAILED:", error?.code || error?.name || "Error");
  console.error("message:", error?.message?.replace(/secret_[a-zA-Z0-9]+/g, "[redacted]"));
  process.exit(1);
}

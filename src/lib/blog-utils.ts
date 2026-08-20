import type { Locale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import type { NotionBlock } from "@/types/blog";

const WORDS_PER_MINUTE = 200;

const CYRILLIC_TO_LATIN: Record<string, string> = {
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

/**
 * Builds a URL-safe slug from a title when Notion `slug` is empty.
 * Prefer filling `slug` in Notion for stable permalinks.
 */
export function slugifyBlogTitle(title: string): string {
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

export function estimateReadingTimeMinutes(blocks: NotionBlock[]): number {
  const words = countWordsInBlocks(blocks);
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

export function estimateReadingTimeFromText(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

function countWordsInBlocks(blocks: NotionBlock[]): number {
  return blocks.reduce((total, block) => {
    const segmentWords = block.richText
      .map((segment) => segment.plainText.trim().split(/\s+/).filter(Boolean).length)
      .reduce((sum, count) => sum + count, 0);

    const childWords = block.children ? countWordsInBlocks(block.children) : 0;
    return total + segmentWords + childWords;
  }, 0);
}

export function formatBlogDate(dateIso: string, locale: Locale): string {
  const date = new Date(dateIso);
  if (Number.isNaN(date.getTime())) {
    return dateIso;
  }

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function isValidBlogLocale(value: string): value is Locale {
  return (routing.locales as readonly string[]).includes(value);
}

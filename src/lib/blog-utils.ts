import type { Locale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import type { NotionBlock } from "@/types/blog";

const WORDS_PER_MINUTE = 200;

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

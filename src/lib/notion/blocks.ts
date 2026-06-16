import type { Client } from "@notionhq/client";
import type {
  BlockObjectResponse,
  RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints";
import type { NotionBlock, RichTextSegment } from "@/types/blog";

const CONTENT_BLOCK_TYPES = new Set([
  "paragraph",
  "heading_1",
  "heading_2",
  "heading_3",
  "bulleted_list_item",
  "numbered_list_item",
  "quote",
  "code",
  "callout",
  "divider",
  "image",
  "bookmark",
  "to_do",
]);

function mapRichText(items: RichTextItemResponse[] | undefined): RichTextSegment[] {
  if (!items?.length) {
    return [];
  }

  return items.map((item) => ({
    plainText: item.plain_text,
    href: item.href ?? undefined,
    bold: item.annotations.bold,
    italic: item.annotations.italic,
    code: item.annotations.code,
  }));
}

function getBlockRichText(block: BlockObjectResponse): RichTextSegment[] {
  switch (block.type) {
    case "paragraph":
      return mapRichText(block.paragraph.rich_text);
    case "heading_1":
      return mapRichText(block.heading_1.rich_text);
    case "heading_2":
      return mapRichText(block.heading_2.rich_text);
    case "heading_3":
      return mapRichText(block.heading_3.rich_text);
    case "bulleted_list_item":
      return mapRichText(block.bulleted_list_item.rich_text);
    case "numbered_list_item":
      return mapRichText(block.numbered_list_item.rich_text);
    case "quote":
      return mapRichText(block.quote.rich_text);
    case "callout":
      return mapRichText(block.callout.rich_text);
    case "to_do":
      return mapRichText(block.to_do.rich_text);
    default:
      return [];
  }
}

function mapBlock(block: BlockObjectResponse, children?: NotionBlock[]): NotionBlock {
  const base: NotionBlock = {
    id: block.id,
    type: block.type,
    hasChildren: block.has_children,
    richText: getBlockRichText(block),
    children,
  };

  if (block.type === "image") {
    if (block.image.type === "external") {
      base.url = block.image.external.url;
    } else if (block.image.type === "file") {
      base.url = block.image.file.url;
    }
    base.caption = mapRichText(block.image.caption)
      .map((segment) => segment.plainText)
      .join("");
  }

  if (block.type === "bookmark") {
    base.url = block.bookmark.url;
    base.richText = mapRichText(block.bookmark.caption);
  }

  if (block.type === "code") {
    base.language = block.code.language;
    base.richText = mapRichText(block.code.rich_text);
  }

  if (block.type === "to_do") {
    base.checked = block.to_do.checked;
  }

  return base;
}

async function fetchBlockChildren(
  notion: Client,
  blockId: string,
): Promise<NotionBlock[]> {
  const children: NotionBlock[] = [];
  let cursor: string | undefined;

  do {
    const response = await notion.blocks.children.list({
      block_id: blockId,
      start_cursor: cursor,
      page_size: 100,
    });

    for (const block of response.results) {
      if (!("type" in block) || !CONTENT_BLOCK_TYPES.has(block.type)) {
        continue;
      }

      const typedBlock = block as BlockObjectResponse;
      let nestedChildren: NotionBlock[] | undefined;

      if (typedBlock.has_children) {
        nestedChildren = await fetchBlockChildren(notion, typedBlock.id);
      }

      children.push(mapBlock(typedBlock, nestedChildren));
    }

    cursor = response.has_more ? response.next_cursor ?? undefined : undefined;
  } while (cursor);

  return children;
}

export async function fetchPageBlocks(
  notion: Client,
  pageId: string,
): Promise<NotionBlock[]> {
  return fetchBlockChildren(notion, pageId);
}

export function blocksToPlainText(blocks: NotionBlock[]): string {
  return blocks
    .map((block) => {
      const text = block.richText.map((segment) => segment.plainText).join("");
      const childText = block.children ? blocksToPlainText(block.children) : "";
      return [text, childText].filter(Boolean).join(" ");
    })
    .join(" ");
}

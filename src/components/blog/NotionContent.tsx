import Image from "next/image";
import type { NotionBlock, RichTextSegment } from "@/types/blog";
import { cn } from "@/lib/utils";

type NotionContentProps = {
  blocks: NotionBlock[];
};

function RichText({ segments }: { segments: RichTextSegment[] }) {
  if (!segments.length) {
    return null;
  }

  return (
    <>
      {segments.map((segment, index) => {
        const content = segment.plainText;
        if (!content) {
          return null;
        }

        let node: React.ReactNode = content;

        if (segment.code) {
          node = (
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-sm">{content}</code>
          );
        }

        if (segment.bold) {
          node = <strong>{node}</strong>;
        }

        if (segment.italic) {
          node = <em>{node}</em>;
        }

        if (segment.href) {
          node = (
            <a
              href={segment.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-2"
            >
              {node}
            </a>
          );
        }

        return <span key={`${index}-${content.slice(0, 12)}`}>{node}</span>;
      })}
    </>
  );
}

function BlockList({
  blocks,
  ordered,
}: {
  blocks: NotionBlock[];
  ordered?: boolean;
}) {
  const ListTag = ordered ? "ol" : "ul";

  return (
    <ListTag
      className={cn(
        "my-4 space-y-2 pl-6",
        ordered ? "list-decimal" : "list-disc",
      )}
    >
      {blocks.map((block) => (
        <li key={block.id} className="leading-relaxed text-foreground/90">
          <RichText segments={block.richText} />
          {block.children?.length ? (
            <BlockList blocks={block.children} ordered={ordered} />
          ) : null}
        </li>
      ))}
    </ListTag>
  );
}

function NotionBlockRenderer({ block }: { block: NotionBlock }) {
  switch (block.type) {
    case "heading_1":
      return (
        <h2 className="mt-10 mb-4 text-3xl font-semibold tracking-tight">
          <RichText segments={block.richText} />
        </h2>
      );
    case "heading_2":
      return (
        <h3 className="mt-8 mb-3 text-2xl font-semibold tracking-tight">
          <RichText segments={block.richText} />
        </h3>
      );
    case "heading_3":
      return (
        <h4 className="mt-6 mb-2 text-xl font-semibold tracking-tight">
          <RichText segments={block.richText} />
        </h4>
      );
    case "paragraph":
      return (
        <p className="my-4 leading-relaxed text-foreground/90">
          <RichText segments={block.richText} />
        </p>
      );
    case "quote":
      return (
        <blockquote className="my-6 border-l-4 border-primary/30 pl-4 italic text-muted-foreground">
          <RichText segments={block.richText} />
        </blockquote>
      );
    case "code":
      return (
        <pre className="my-6 overflow-x-auto rounded-[var(--radius-card)] bg-muted p-4 text-sm">
          <code>{block.richText.map((segment) => segment.plainText).join("")}</code>
        </pre>
      );
    case "callout":
      return (
        <div className="my-6 rounded-[var(--radius-card)] border border-border bg-muted/50 p-4">
          <RichText segments={block.richText} />
          {block.children?.length ? <NotionContent blocks={block.children} /> : null}
        </div>
      );
    case "divider":
      return <hr className="my-8 border-border" />;
    case "image":
      return block.url ? (
        <figure className="my-8 overflow-hidden rounded-[var(--radius-card)]">
          <div className="relative aspect-[16/10] w-full bg-muted">
            <Image
              src={block.url}
              alt={block.caption || "Blog image"}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>
          {block.caption ? (
            <figcaption className="mt-2 text-center text-sm text-muted-foreground">
              {block.caption}
            </figcaption>
          ) : null}
        </figure>
      ) : null;
    case "bookmark":
      return block.url ? (
        <a
          href={block.url}
          target="_blank"
          rel="noopener noreferrer"
          className="my-4 block rounded-[var(--radius-card)] border border-border p-4 text-primary underline underline-offset-2"
        >
          {block.richText.length ? (
            <RichText segments={block.richText} />
          ) : (
            block.url
          )}
        </a>
      ) : null;
    case "to_do":
      return (
        <div className="my-2 flex items-start gap-2">
          <input type="checkbox" checked={block.checked} readOnly disabled className="mt-1" />
          <span className="leading-relaxed">
            <RichText segments={block.richText} />
          </span>
        </div>
      );
    default:
      return block.richText.length ? (
        <p className="my-4 leading-relaxed">
          <RichText segments={block.richText} />
        </p>
      ) : null;
  }
}

function groupBlocks(blocks: NotionBlock[]): NotionBlock[][] {
  const groups: NotionBlock[][] = [];
  let currentGroup: NotionBlock[] = [];
  let currentListType: NotionBlock["type"] | null = null;

  for (const block of blocks) {
    const isListItem =
      block.type === "bulleted_list_item" || block.type === "numbered_list_item";

    if (isListItem) {
      if (currentListType && currentListType !== block.type) {
        groups.push(currentGroup);
        currentGroup = [];
      }
      currentListType = block.type;
      currentGroup.push(block);
      continue;
    }

    if (currentGroup.length) {
      groups.push(currentGroup);
      currentGroup = [];
      currentListType = null;
    }

    groups.push([block]);
  }

  if (currentGroup.length) {
    groups.push(currentGroup);
  }

  return groups;
}

export function NotionContent({ blocks }: NotionContentProps) {
  return (
    <div className="blog-content">
      {groupBlocks(blocks).map((group) => {
        const first = group[0];
        if (!first) {
          return null;
        }

        if (
          first.type === "bulleted_list_item" ||
          first.type === "numbered_list_item"
        ) {
          return (
            <BlockList
              key={`${first.type}-${first.id}`}
              blocks={group}
              ordered={first.type === "numbered_list_item"}
            />
          );
        }

        return <NotionBlockRenderer key={first.id} block={first} />;
      })}
    </div>
  );
}

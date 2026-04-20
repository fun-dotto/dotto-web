import Link from "next/link";
import type {
  BlockObjectResponse,
  RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { CopyableHeading } from "./CopyableHeading";
import { CopyCodeButton } from "./CopyCodeButton";

function normalizeNotionPageId(raw: string): string {
  const hex = raw.replace(/-/g, "").toLowerCase();
  if (hex.length !== 32) return raw;
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function extractNotionIds(href: string): {
  pageId: string | null;
  blockId: string | null;
} {
  const matches = [
    ...href.matchAll(
      /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|[0-9a-f]{32})/gi
    ),
  ];
  const [first, second] = matches;
  return {
    pageId: first ? normalizeNotionPageId(first[1]) : null,
    blockId: second ? normalizeNotionPageId(second[1]) : null,
  };
}

function resolveInternalHref(item: RichTextItemResponse): string | null {
  if (item.type === "mention" && item.mention.type === "page") {
    const pageId = normalizeNotionPageId(item.mention.page.id);
    const blockId = item.href
      ? extractNotionIds(item.href).blockId
      : null;
    const normalizedBlock =
      blockId && blockId !== pageId ? blockId : null;
    return normalizedBlock ? `/mac/${pageId}#${normalizedBlock}` : `/mac/${pageId}`;
  }
  if (item.href) {
    const isNotionLink =
      item.href.startsWith("/") || /notion\.so\//i.test(item.href);
    if (isNotionLink) {
      const { pageId, blockId } = extractNotionIds(item.href);
      if (pageId) {
        return blockId ? `/mac/${pageId}#${blockId}` : `/mac/${pageId}`;
      }
    }
  }
  return null;
}

function RichText({ items }: { items: RichTextItemResponse[] }) {
  return (
    <>
      {items.map((item, i) => {
        const { annotations, plain_text, href } = item;
        let node: React.ReactNode = plain_text;

        if (annotations.code) {
          node = (
            <code className="rounded bg-background-primary px-1 py-0.5 font-mono text-sm text-label-primary">
              {node}
            </code>
          );
        }
        if (annotations.bold) node = <strong>{node}</strong>;
        if (annotations.italic) node = <em>{node}</em>;
        if (annotations.strikethrough) node = <s>{node}</s>;
        if (annotations.underline) node = <u>{node}</u>;

        const internalHref = resolveInternalHref(item);
        if (internalHref) {
          const isHashLink = internalHref.includes("#");
          node = isHashLink ? (
            <a
              href={internalHref}
              className="text-accent-info underline hover:opacity-80"
            >
              {node}
            </a>
          ) : (
            <Link
              href={internalHref}
              className="text-accent-info underline hover:opacity-80"
            >
              {node}
            </Link>
          );
        } else if (href) {
          node = (
            <a
              href={href}
              className="text-accent-info underline hover:opacity-80"
            >
              {node}
            </a>
          );
        }

        return <span key={i}>{node}</span>;
      })}
    </>
  );
}

function getImageUrl(
  image: Extract<BlockObjectResponse, { type: "image" }>["image"]
): string {
  if (image.type === "external") return image.external.url;
  return image.file.url;
}

export function NotionBlock({ block }: { block: BlockObjectResponse }) {
  switch (block.type) {
    case "paragraph":
      return (
        <p className="mb-4 leading-7 text-label-secondary">
          <RichText items={block.paragraph.rich_text} />
        </p>
      );

    case "heading_1":
      return (
        <CopyableHeading blockId={block.id} level={1}>
          <RichText items={block.heading_1.rich_text} />
        </CopyableHeading>
      );

    case "heading_2":
      return (
        <CopyableHeading blockId={block.id} level={2}>
          <RichText items={block.heading_2.rich_text} />
        </CopyableHeading>
      );

    case "heading_3":
      return (
        <CopyableHeading blockId={block.id} level={3}>
          <RichText items={block.heading_3.rich_text} />
        </CopyableHeading>
      );

    case "bulleted_list_item":
      return (
        <li className="mb-1 ml-4 list-disc leading-7 text-label-secondary">
          <RichText items={block.bulleted_list_item.rich_text} />
        </li>
      );

    case "numbered_list_item":
      return (
        <li className="mb-1 ml-4 list-decimal leading-7 text-label-secondary">
          <RichText items={block.numbered_list_item.rich_text} />
        </li>
      );

    case "to_do":
      return (
        <div className="mb-1 flex items-start gap-2">
          <input
            type="checkbox"
            checked={block.to_do.checked ?? false}
            readOnly
            className="mt-1 h-4 w-4 rounded border-border-primary"
          />
          <span
            className={`leading-7 text-label-secondary ${block.to_do.checked ? "line-through opacity-60" : ""}`}
          >
            <RichText items={block.to_do.rich_text} />
          </span>
        </div>
      );

    case "quote":
      return (
        <blockquote className="mb-4 border-l-4 border-border-primary pl-4 italic text-label-secondary">
          <RichText items={block.quote.rich_text} />
        </blockquote>
      );

    case "callout":
      return (
        <div className="mb-4 flex gap-3 rounded-lg bg-background-primary border border-border-primary p-4">
          {block.callout.icon && block.callout.icon.type === "emoji" && (
            <span className="text-xl">{block.callout.icon.emoji}</span>
          )}
          <div className="leading-7 text-label-secondary">
            <RichText items={block.callout.rich_text} />
          </div>
        </div>
      );

    case "code": {
      const codeText = block.code.rich_text.map((t) => t.plain_text).join("");
      return (
        <div className="mb-4">
          <div className="group relative">
            <pre className="overflow-x-auto rounded-lg bg-background-tertiary p-4 text-sm text-label-tertiary">
              <code>{codeText}</code>
            </pre>
            <CopyCodeButton code={codeText} />
          </div>
          {block.code.caption.length > 0 && (
            <p className="mt-1 text-sm text-label-secondary">
              <RichText items={block.code.caption} />
            </p>
          )}
        </div>
      );
    }

    case "image": {
      const url = getImageUrl(block.image);
      return (
        <figure className="mb-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={block.image.caption.map((t) => t.plain_text).join("") || ""}
            className="w-full rounded-lg"
          />
          {block.image.caption.length > 0 && (
            <figcaption className="mt-2 text-center text-sm text-label-secondary">
              <RichText items={block.image.caption} />
            </figcaption>
          )}
        </figure>
      );
    }

    case "divider":
      return <hr className="my-6 border-border-primary" />;

    case "child_page":
      return (
        <p className="mb-2">
          <Link
            href={`/mac/${normalizeNotionPageId(block.id)}`}
            className="text-accent-info underline hover:opacity-80"
          >
            {block.child_page.title || "無題"}
          </Link>
        </p>
      );

    case "link_to_page": {
      const lp = block.link_to_page;
      const targetId =
        lp.type === "page_id"
          ? lp.page_id
          : lp.type === "database_id"
            ? lp.database_id
            : null;
      if (!targetId) return null;
      return (
        <p className="mb-2">
          <Link
            href={`/mac/${normalizeNotionPageId(targetId)}`}
            className="text-accent-info underline hover:opacity-80"
          >
            → ページを開く
          </Link>
        </p>
      );
    }

    case "toggle":
      return (
        <details className="mb-4">
          <summary className="cursor-pointer font-medium text-label-primary">
            <RichText items={block.toggle.rich_text} />
          </summary>
        </details>
      );

    default:
      return null;
  }
}

export function NotionRenderer({ blocks }: { blocks: BlockObjectResponse[] }) {
  return (
    <div className="notion-content">
      {blocks.map((block) => (
        <div key={block.id} id={block.id} className="scroll-mt-24">
          <NotionBlock block={block} />
        </div>
      ))}
    </div>
  );
}

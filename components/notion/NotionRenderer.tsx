import type {
  BlockObjectResponse,
  RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints";

function RichText({ items }: { items: RichTextItemResponse[] }) {
  return (
    <>
      {items.map((item, i) => {
        const { annotations, plain_text, href } = item;
        let node: React.ReactNode = plain_text;

        if (annotations.code) {
          node = (
            <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-sm dark:bg-zinc-800">
              {node}
            </code>
          );
        }
        if (annotations.bold) node = <strong>{node}</strong>;
        if (annotations.italic) node = <em>{node}</em>;
        if (annotations.strikethrough) node = <s>{node}</s>;
        if (annotations.underline) node = <u>{node}</u>;
        if (href) {
          node = (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
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
        <p className="mb-4 leading-7 text-zinc-700 dark:text-zinc-300">
          <RichText items={block.paragraph.rich_text} />
        </p>
      );

    case "heading_1":
      return (
        <h1 className="mb-4 mt-8 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          <RichText items={block.heading_1.rich_text} />
        </h1>
      );

    case "heading_2":
      return (
        <h2 className="mb-3 mt-6 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          <RichText items={block.heading_2.rich_text} />
        </h2>
      );

    case "heading_3":
      return (
        <h3 className="mb-2 mt-5 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          <RichText items={block.heading_3.rich_text} />
        </h3>
      );

    case "bulleted_list_item":
      return (
        <li className="mb-1 ml-4 list-disc leading-7 text-zinc-700 dark:text-zinc-300">
          <RichText items={block.bulleted_list_item.rich_text} />
        </li>
      );

    case "numbered_list_item":
      return (
        <li className="mb-1 ml-4 list-decimal leading-7 text-zinc-700 dark:text-zinc-300">
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
            className="mt-1 h-4 w-4 rounded border-zinc-300"
          />
          <span
            className={`leading-7 text-zinc-700 dark:text-zinc-300 ${block.to_do.checked ? "line-through opacity-60" : ""}`}
          >
            <RichText items={block.to_do.rich_text} />
          </span>
        </div>
      );

    case "quote":
      return (
        <blockquote className="mb-4 border-l-4 border-zinc-300 pl-4 italic text-zinc-600 dark:border-zinc-600 dark:text-zinc-400">
          <RichText items={block.quote.rich_text} />
        </blockquote>
      );

    case "callout":
      return (
        <div className="mb-4 flex gap-3 rounded-lg bg-zinc-100 p-4 dark:bg-zinc-800">
          {block.callout.icon && block.callout.icon.type === "emoji" && (
            <span className="text-xl">{block.callout.icon.emoji}</span>
          )}
          <div className="leading-7 text-zinc-700 dark:text-zinc-300">
            <RichText items={block.callout.rich_text} />
          </div>
        </div>
      );

    case "code":
      return (
        <div className="mb-4">
          <pre className="overflow-x-auto rounded-lg bg-zinc-900 p-4 text-sm text-zinc-100">
            <code>{block.code.rich_text.map((t) => t.plain_text).join("")}</code>
          </pre>
          {block.code.caption.length > 0 && (
            <p className="mt-1 text-sm text-zinc-500">
              <RichText items={block.code.caption} />
            </p>
          )}
        </div>
      );

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
            <figcaption className="mt-2 text-center text-sm text-zinc-500">
              <RichText items={block.image.caption} />
            </figcaption>
          )}
        </figure>
      );
    }

    case "divider":
      return <hr className="my-6 border-zinc-200 dark:border-zinc-700" />;

    case "toggle":
      return (
        <details className="mb-4">
          <summary className="cursor-pointer font-medium text-zinc-900 dark:text-zinc-50">
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
        <NotionBlock key={block.id} block={block} />
      ))}
    </div>
  );
}

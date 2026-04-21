import type {
  BlockObjectResponse,
  RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints";

function richTextToMarkdown(items: RichTextItemResponse[]): string {
  return items
    .map((item) => {
      let text = item.plain_text;
      const { annotations, href } = item;
      if (annotations.code) text = `\`${text}\``;
      if (annotations.bold) text = `**${text}**`;
      if (annotations.italic) text = `*${text}*`;
      if (annotations.strikethrough) text = `~~${text}~~`;
      if (href) text = `[${text}](${href})`;
      return text;
    })
    .join("");
}

function blockToMarkdown(block: BlockObjectResponse): string {
  switch (block.type) {
    case "paragraph":
      return richTextToMarkdown(block.paragraph.rich_text);
    case "heading_1":
      return `# ${richTextToMarkdown(block.heading_1.rich_text)}`;
    case "heading_2":
      return `## ${richTextToMarkdown(block.heading_2.rich_text)}`;
    case "heading_3":
      return `### ${richTextToMarkdown(block.heading_3.rich_text)}`;
    case "bulleted_list_item":
      return `- ${richTextToMarkdown(block.bulleted_list_item.rich_text)}`;
    case "numbered_list_item":
      return `1. ${richTextToMarkdown(block.numbered_list_item.rich_text)}`;
    case "to_do": {
      const check = block.to_do.checked ? "x" : " ";
      return `- [${check}] ${richTextToMarkdown(block.to_do.rich_text)}`;
    }
    case "quote":
      return `> ${richTextToMarkdown(block.quote.rich_text)}`;
    case "callout": {
      const icon =
        block.callout.icon?.type === "emoji"
          ? `${block.callout.icon.emoji} `
          : "";
      return `> ${icon}${richTextToMarkdown(block.callout.rich_text)}`;
    }
    case "code": {
      const lang = block.code.language ?? "";
      const body = block.code.rich_text.map((t) => t.plain_text).join("");
      return `\`\`\`${lang}\n${body}\n\`\`\``;
    }
    case "image": {
      const url =
        block.image.type === "external"
          ? block.image.external.url
          : block.image.file.url;
      const alt = block.image.caption.map((t) => t.plain_text).join("");
      return `![${alt}](${url})`;
    }
    case "divider":
      return "---";
    case "toggle":
      return richTextToMarkdown(block.toggle.rich_text);
    case "child_page":
      return `- [${block.child_page.title || "無題"}](/mac/${block.id})`;
    case "link_to_page": {
      const lp = block.link_to_page;
      const id =
        lp.type === "page_id"
          ? lp.page_id
          : lp.type === "database_id"
            ? lp.database_id
            : null;
      return id ? `- [ページを開く](/mac/${id})` : "";
    }
    default:
      return "";
  }
}

export function blocksToMarkdown(
  title: string,
  blocks: BlockObjectResponse[]
): string {
  const body = blocks
    .map(blockToMarkdown)
    .filter((line) => line.length > 0)
    .join("\n\n");
  return `# ${title}\n\n${body}\n`;
}

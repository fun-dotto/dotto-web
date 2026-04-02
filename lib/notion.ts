import { Client } from "@notionhq/client";
import type {
  BlockObjectResponse,
  PageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";

export const notion = new Client({ auth: process.env.NOTION_TOKEN });

const dataSourceId = process.env.NOTION_MAC_DATABASE_ID!;

export async function getMacPages(): Promise<PageObjectResponse[]> {
  const res = await notion.dataSources.query({
    data_source_id: dataSourceId,
    sorts: [{ property: "最終更新日時", direction: "descending" }],
  });
  return res.results.filter(
    (p): p is PageObjectResponse => p.object === "page"
  );
}

export async function getPage(pageId: string): Promise<PageObjectResponse> {
  const page = await notion.pages.retrieve({ page_id: pageId });
  return page as PageObjectResponse;
}

export async function getPageBlocks(
  pageId: string
): Promise<BlockObjectResponse[]> {
  const res = await notion.blocks.children.list({ block_id: pageId });
  return res.results.filter((b): b is BlockObjectResponse => "type" in b);
}

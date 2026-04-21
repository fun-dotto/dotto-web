import { Client } from "@notionhq/client";
import { unstable_cache } from "next/cache";
import type {
  BlockObjectResponse,
  DatabaseObjectResponse,
  PageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";

export const notion = new Client({ auth: process.env.NOTION_TOKEN });

const databaseId = process.env.NOTION_MAC_DATABASE_ID!;
const isProduction = process.env.NODE_ENV === "production";
const MAC_CACHE_REVALIDATE_SECONDS = 15 * 60;

async function getDataSourceId(): Promise<string> {
  const db = await notion.databases.retrieve({ database_id: databaseId });
  if (db.object !== "database") {
    throw new Error("Expected a full database response");
  }
  const fullDb = db as DatabaseObjectResponse;
  const first = fullDb.data_sources[0];
  if (!first) throw new Error("No data sources found for database");
  return first.id;
}

export async function getMacPages(): Promise<PageObjectResponse[]> {
  if (!isProduction) {
    return getMacPagesRaw();
  }
  return getMacPagesCached();
}

async function getMacPagesRaw(): Promise<PageObjectResponse[]> {
  const dataSourceId = await getDataSourceId();
  const res = await notion.dataSources.query({
    data_source_id: dataSourceId,
    sorts: [{ property: "最終更新日時", direction: "descending" }],
  });
  return res.results.filter(
    (p): p is PageObjectResponse => p.object === "page"
  );
}

export async function getPage(pageId: string): Promise<PageObjectResponse> {
  if (!isProduction) {
    return getPageRaw(pageId);
  }
  return getPageCached(pageId);
}

async function getPageRaw(pageId: string): Promise<PageObjectResponse> {
  const page = await notion.pages.retrieve({ page_id: pageId });
  return page as PageObjectResponse;
}

export async function getPageBlocks(
  pageId: string
): Promise<BlockObjectResponse[]> {
  if (!isProduction) {
    return getPageBlocksRaw(pageId);
  }
  return getPageBlocksCached(pageId);
}

async function getPageBlocksRaw(
  pageId: string
): Promise<BlockObjectResponse[]> {
  const res = await notion.blocks.children.list({ block_id: pageId });
  return res.results.filter((b): b is BlockObjectResponse => "type" in b);
}

const getMacPagesCached = unstable_cache(getMacPagesRaw, ["mac-pages"], {
  revalidate: MAC_CACHE_REVALIDATE_SECONDS,
});

const getPageCached = unstable_cache(getPageRaw, ["mac-page"], {
  revalidate: MAC_CACHE_REVALIDATE_SECONDS,
});

const getPageBlocksCached = unstable_cache(getPageBlocksRaw, ["mac-page-blocks"], {
  revalidate: MAC_CACHE_REVALIDATE_SECONDS,
});

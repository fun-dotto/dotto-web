import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { getPage, getPageBlocks, getMacPages } from "@/lib/notion";
import { NotionRenderer } from "@/components/notion/NotionRenderer";
import { Badge } from "@/components/ui/badge";

function getTitle(page: PageObjectResponse): string {
  const prop = page.properties["ページ"];
  if (prop?.type === "title") {
    return prop.title.map((t) => t.plain_text).join("") || "無題";
  }
  return "無題";
}

function getTags(page: PageObjectResponse): string[] {
  const prop = page.properties["タグ"];
  if (prop?.type === "multi_select") {
    return prop.multi_select.map((s) => s.name);
  }
  return [];
}

function getLastEdited(page: PageObjectResponse): string {
  const prop = page.properties["最終更新日時"];
  if (prop?.type === "last_edited_time") {
    return new Date(prop.last_edited_time).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
  return "";
}

export async function generateStaticParams() {
  const pages = await getMacPages();
  return pages.map((page) => ({ pageId: page.id.replace(/-/g, "") }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pageId: string }>;
}): Promise<Metadata> {
  try {
    const { pageId } = await params;
    const page = await getPage(pageId);
    return { title: getTitle(page) };
  } catch {
    return { title: "Mac サポート" };
  }
}

export default async function MacDetailPage({
  params,
}: {
  params: Promise<{ pageId: string }>;
}) {
  const { pageId } = await params;

  let page: PageObjectResponse;
  try {
    page = await getPage(pageId);
  } catch {
    notFound();
  }

  const blocks = await getPageBlocks(pageId);
  const title = getTitle(page);
  const tags = getTags(page);
  const lastEdited = getLastEdited(page);

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/mac"
          className="mb-4 -ml-2 inline-flex items-center rounded-lg px-2 py-1 text-sm text-label-secondary hover:bg-background-secondary hover:text-label-primary"
        >
          ← 一覧に戻る
        </Link>

        <h1 className="mb-3 text-3xl font-bold tracking-tight text-label-primary">
          {title}
        </h1>

        <div className="flex flex-wrap items-center gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
          {lastEdited && (
            <span className="text-sm text-label-secondary">
              最終更新: {lastEdited}
            </span>
          )}
        </div>
      </div>

      <div className="rounded-xl bg-background-secondary p-8 shadow-sm border border-border-primary">
        {blocks.length === 0 ? (
          <p className="text-center text-label-secondary">コンテンツがありません</p>
        ) : (
          <NotionRenderer blocks={blocks} />
        )}
      </div>
    </div>
  );
}

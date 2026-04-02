import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { getPage, getPageBlocks, getMacPages } from "@/lib/notion";
import { NotionRenderer } from "@/components/notion/NotionRenderer";

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
      {/* Header */}
      <div className="bg-background-tertiary -mx-6 -mt-6 px-6 pt-6 pb-8 mb-8">
        <Link
          href="/mac"
          className="group inline-flex items-center gap-1.5 text-xs text-label-tertiary/50 hover:text-label-tertiary/80 transition-colors duration-200 mb-6"
        >
          <span className="group-hover:-translate-x-0.5 transition-transform duration-200 inline-block">
            ←
          </span>
          <span>Mac サポート</span>
        </Link>

        <h1 className="text-4xl font-bold tracking-tight text-label-tertiary leading-tight mb-4">
          {title}
        </h1>

        <div className="flex flex-wrap items-center gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2.5 py-0.5 rounded-full border border-label-tertiary/20 text-label-tertiary/60"
            >
              {tag}
            </span>
          ))}
          {lastEdited && (
            <span className="text-xs text-label-tertiary/40 tabular-nums">
              {lastEdited} 更新
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="bg-background-secondary rounded-xl border border-border-primary p-8">
        {blocks.length === 0 ? (
          <p className="text-center text-label-secondary text-sm py-8">
            コンテンツがありません
          </p>
        ) : (
          <NotionRenderer blocks={blocks} />
        )}
      </div>
    </div>
  );
}

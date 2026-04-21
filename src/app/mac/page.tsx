import Link from "next/link";
import type { Metadata } from "next";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { getMacPages } from "@/lib/notion";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mac サポート",
  description: "Mac サポートページ一覧",
};

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

function getDateStart(page: PageObjectResponse, name: string): Date | null {
  const prop = page.properties[name];
  if (prop?.type === "date" && prop.date?.start) {
    return new Date(prop.date.start);
  }
  return null;
}

function isPublished(page: PageObjectResponse, now: Date): boolean {
  const start = getDateStart(page, "公開開始日時");
  const end = getDateStart(page, "公開終了日時");
  if (!start || start > now) return false;
  if (end && end <= now) return false;
  return true;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function MacPage() {
  const allPages = await getMacPages();
  const filtered =
    process.env.NODE_ENV === "development"
      ? allPages
      : allPages.filter((p) => isPublished(p, new Date()));
  const pages = [...filtered].sort((a, b) => {
    const aStart = getDateStart(a, "公開開始日時")?.getTime() ?? 0;
    const bStart = getDateStart(b, "公開開始日時")?.getTime() ?? 0;
    return bStart - aStart;
  });

  return (
    <div>
      {/* Hero Header */}
      <div className="bg-background-tertiary -mx-6 -mt-6 px-6 pt-10 pb-8 mb-8">
        <p className="text-xs font-medium tracking-[0.25em] uppercase mb-3 text-label-tertiary/50">
          Support / Mac
        </p>
        <div className="flex items-end justify-between">
          <h1 className="text-5xl font-bold tracking-tight text-label-tertiary leading-none">
            Mac サポート
          </h1>
          <p className="text-sm text-label-tertiary/40 pb-1 tabular-nums">
            {pages.length} 件
          </p>
        </div>
      </div>

      {/* Article List */}
      {pages.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-label-secondary text-sm">ページがありません</p>
        </div>
      ) : (
        <ul className="divide-y divide-border-primary">
          {pages.map((page) => {
            const title = getTitle(page);
            const tags = getTags(page);
            const createdAtDate = getDateStart(page, "公開開始日時");
            const createdAt = createdAtDate ? formatDate(createdAtDate) : "";
            const lastEditedProp = page.properties["最終更新日時"];
            const lastEditedDate =
              lastEditedProp?.type === "last_edited_time"
                ? new Date(lastEditedProp.last_edited_time)
                : null;
            const lastEdited =
              lastEditedDate &&
              (!createdAtDate || lastEditedDate >= createdAtDate)
                ? formatDate(lastEditedDate)
                : "";
            const pageId = page.id.replace(/-/g, "");

            return (
              <li key={page.id}>
                <Link
                  href={`/mac/${pageId}`}
                  className="group flex items-center gap-5 py-4 -mx-2 px-2 rounded-lg hover:bg-background-secondary transition-colors duration-200"
                >
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-label-primary group-hover:text-accent-info transition-colors duration-200">
                      {title}
                    </p>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-0.5 rounded-full border border-border-primary text-label-secondary bg-background-primary"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Date */}
                  {(createdAt || lastEdited) && (
                    <div className="hidden sm:flex flex-col items-end gap-0.5 text-xs shrink-0 tabular-nums">
                      {createdAt && (
                        <span className="text-label-primary">
                          {createdAt} 作成
                        </span>
                      )}
                      {lastEdited && (
                        <span className="text-label-secondary">
                          {lastEdited} 更新
                        </span>
                      )}
                    </div>
                  )}

                  {/* Arrow */}
                  <span className="text-label-primary/20 group-hover:text-accent-info group-hover:translate-x-1 transition-all duration-200 shrink-0 text-sm">
                    →
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

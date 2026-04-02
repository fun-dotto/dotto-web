import Link from "next/link";
import type { Metadata } from "next";
import { getMacPages } from "@/lib/notion";
import {
  getMacPageLastEdited,
  getMacPageTags,
  getMacPageTitle,
} from "@/lib/mac-support";

export const metadata: Metadata = {
  title: "Mac サポート",
  description: "Mac サポートページ一覧",
};

export default async function MacPage() {
  const pages = await getMacPages();

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
          {pages.map((page, index) => {
            const title = getMacPageTitle(page);
            const tags = getMacPageTags(page);
            const lastEdited = getMacPageLastEdited(page);
            const pageId = page.id.replace(/-/g, "");

            return (
              <li key={page.id}>
                <Link
                  href={`/mac/${pageId}`}
                  className="group flex items-center gap-5 py-4 -mx-2 px-2 rounded-lg hover:bg-background-secondary transition-colors duration-200"
                >
                  {/* Index */}
                  <span className="text-xs font-mono tabular-nums w-7 shrink-0 text-label-secondary/40 group-hover:text-accent-info group-hover:opacity-100 transition-all duration-200">
                    {String(index + 1).padStart(2, "0")}
                  </span>

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
                  {lastEdited && (
                    <span className="hidden sm:block text-xs text-label-secondary shrink-0 tabular-nums">
                      {lastEdited}
                    </span>
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

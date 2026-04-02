import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { getPage, getPageBlocks, getMacPages } from "@/lib/notion";
import {
  getMacPageLastEdited,
  getMacPageLastEditedISO,
  getMacPageTags,
  getMacPageTitle,
} from "@/lib/mac-support";
import { NotionRenderer } from "@/components/notion/NotionRenderer";

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
    return { title: getMacPageTitle(page) };
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
  const pages = await getMacPages();
  const title = getMacPageTitle(page);
  const tags = getMacPageTags(page);
  const lastEdited = getMacPageLastEdited(page);
  const lastEditedISO = getMacPageLastEditedISO(page);
  const currentIndex = pages.findIndex((item) => item.id === page.id);
  const previousPage = currentIndex > 0 ? pages[currentIndex - 1] : null;
  const nextPage =
    currentIndex >= 0 && currentIndex < pages.length - 1
      ? pages[currentIndex + 1]
      : null;
  const articleNumber =
    currentIndex >= 0 ? String(currentIndex + 1).padStart(2, "0") : null;

  return (
    <div className="-mx-6 -mt-6 bg-background-primary">
      <section className="border-b border-border-primary bg-background-secondary">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8 lg:px-10 lg:py-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <Link
                href="/mac"
                className="group mb-5 inline-flex items-center gap-2 rounded-full border border-border-primary bg-background-primary px-3 py-1.5 text-xs font-medium text-label-secondary transition-colors duration-200 hover:border-accent-info hover:text-accent-info"
              >
                <span className="inline-block transition-transform duration-200 group-hover:-translate-x-0.5">
                  ←
                </span>
                <span>Mac サポートに戻る</span>
              </Link>

              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-background-tertiary px-3 py-1 text-[11px] font-semibold tracking-[0.24em] text-label-tertiary uppercase">
                  Mac Support
                </span>
                {articleNumber && (
                  <span className="text-xs font-mono text-label-secondary tabular-nums">
                    Article {articleNumber}
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-label-primary sm:text-4xl lg:text-5xl">
                {title}
              </h1>
            </div>

            <div className="grid min-w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:min-w-80 lg:max-w-sm lg:grid-cols-1">
              <div className="rounded-2xl border border-border-primary bg-background-primary p-4">
                <p className="mb-1 text-[11px] font-semibold tracking-[0.2em] text-label-secondary uppercase">
                  Last Update
                </p>
                {lastEdited ? (
                  <>
                    <p className="text-base font-semibold text-label-primary">
                      {lastEdited}
                    </p>
                    {lastEditedISO && (
                      <time
                        dateTime={lastEditedISO}
                        className="mt-1 block text-xs text-label-secondary"
                      >
                        Notion の更新日時を反映
                      </time>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-label-secondary">未設定</p>
                )}
              </div>

              <div className="rounded-2xl border border-border-primary bg-background-primary p-4">
                <p className="mb-2 text-[11px] font-semibold tracking-[0.2em] text-label-secondary uppercase">
                  Tags
                </p>
                {tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-border-primary bg-background-secondary px-3 py-1 text-xs font-medium text-label-secondary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-label-secondary">タグなし</p>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-2xl border border-border-primary bg-background-primary p-4">
              <p className="mb-1 text-[11px] font-semibold tracking-[0.2em] text-label-secondary uppercase">
                Reading View
              </p>
              <p className="text-sm leading-6 text-label-secondary">
                本文を主役にしたレイアウトに再構成し、概要情報は上部に集約しています。
              </p>
            </div>

            <div className="rounded-2xl border border-border-primary bg-background-primary p-4 xl:col-span-2">
              <p className="mb-2 text-[11px] font-semibold tracking-[0.2em] text-label-secondary uppercase">
                Navigation
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                {previousPage ? (
                  <Link
                    href={`/mac/${previousPage.id.replace(/-/g, "")}`}
                    className="group rounded-xl border border-border-primary bg-background-secondary p-4 transition-colors duration-200 hover:border-accent-info"
                  >
                    <p className="mb-1 text-xs font-medium text-label-secondary">
                      前の記事
                    </p>
                    <p className="font-semibold text-label-primary transition-colors duration-200 group-hover:text-accent-info">
                      {getMacPageTitle(previousPage)}
                    </p>
                  </Link>
                ) : (
                  <div className="rounded-xl border border-border-primary bg-background-secondary p-4">
                    <p className="mb-1 text-xs font-medium text-label-secondary">
                      前の記事
                    </p>
                    <p className="text-sm text-label-secondary">
                      これが最初の記事です
                    </p>
                  </div>
                )}

                {nextPage ? (
                  <Link
                    href={`/mac/${nextPage.id.replace(/-/g, "")}`}
                    className="group rounded-xl border border-border-primary bg-background-secondary p-4 transition-colors duration-200 hover:border-accent-info"
                  >
                    <p className="mb-1 text-xs font-medium text-label-secondary">
                      次の記事
                    </p>
                    <p className="font-semibold text-label-primary transition-colors duration-200 group-hover:text-accent-info">
                      {getMacPageTitle(nextPage)}
                    </p>
                  </Link>
                ) : (
                  <div className="rounded-xl border border-border-primary bg-background-secondary p-4">
                    <p className="mb-1 text-xs font-medium text-label-secondary">
                      次の記事
                    </p>
                    <p className="text-sm text-label-secondary">
                      これが最後の記事です
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 py-8 lg:px-10 lg:py-10">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px] xl:items-start">
          <article className="min-w-0 rounded-[28px] border border-border-primary bg-background-secondary p-6 shadow-[0_1px_0_0_var(--color-border-primary)] sm:p-8 lg:p-10">
            {blocks.length === 0 ? (
              <p className="py-12 text-center text-sm text-label-secondary">
                コンテンツがありません
              </p>
            ) : (
              <div className="mx-auto max-w-3xl">
                <NotionRenderer blocks={blocks} />
              </div>
            )}
          </article>

          <aside className="rounded-[28px] border border-border-primary bg-background-secondary p-6 xl:sticky xl:top-6">
            <p className="mb-4 text-[11px] font-semibold tracking-[0.2em] text-label-secondary uppercase">
              Reading Notes
            </p>
            <div className="space-y-4">
              <div className="rounded-2xl bg-background-primary p-4">
                <p className="mb-1 text-sm font-semibold text-label-primary">
                  読み進め方
                </p>
                <p className="text-sm leading-6 text-label-secondary">
                  概要を確認してから本文を読むと、セットアップや手順の位置づけを把握しやすくなります。
                </p>
              </div>

              <div className="rounded-2xl bg-background-primary p-4">
                <p className="mb-1 text-sm font-semibold text-label-primary">
                  管理情報
                </p>
                <p className="text-sm leading-6 text-label-secondary">
                  更新日は上部に集約し、本文エリアでは読解を妨げる補助情報を減らしています。
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

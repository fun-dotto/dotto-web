import type { Metadata } from "next";
import { api } from "@/lib/api";

export const metadata: Metadata = {
  title: "お知らせ",
  description: "大学からのお知らせ一覧",
};

function formatDate(iso: string): { year: string; month: string; day: string } {
  const d = new Date(iso);
  return {
    year: String(d.getFullYear()),
    month: String(d.getMonth() + 1).padStart(2, "0"),
    day: String(d.getDate()).padStart(2, "0"),
  };
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function relativeLabel(iso: string, now: Date): string | null {
  const d = new Date(iso);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (isSameDay(d, now)) return "今日";
  if (isSameDay(d, yesterday)) return "昨日";
  const diffDays = Math.floor(
    (today.getTime() - new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()) /
      86400000,
  );
  if (diffDays > 0 && diffDays < 7) return `${diffDays}日前`;
  return null;
}

export default async function Page() {
  const { data, error } = await api.GET("/v1/announcements");

  return (
    <div>
      {/* Hero Header */}
      <div className="bg-background-tertiary -mx-6 -mt-6 px-6 pt-10 pb-8 mb-8">
        <p className="text-xs font-medium tracking-[0.25em] uppercase mb-3 text-label-tertiary/50">
          News / Announcements
        </p>
        <div className="flex items-end justify-between">
          <h1 className="text-5xl font-bold tracking-tight text-label-tertiary leading-none">
            お知らせ
          </h1>
          {data && (
            <p className="text-sm text-label-tertiary/40 pb-1 tabular-nums">
              {data.announcements.length} 件
            </p>
          )}
        </div>
      </div>

      {error || !data ? (
        <div className="py-20 text-center">
          <p className="text-accent-error text-sm">
            お知らせの取得に失敗しました。
          </p>
        </div>
      ) : data.announcements.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-label-secondary text-sm">お知らせはありません</p>
        </div>
      ) : (
        <ul className="divide-y divide-border-primary">
          {data.announcements.map((announcement) => {
            const { year, month, day } = formatDate(announcement.date);
            const relative = relativeLabel(announcement.date, new Date());

            return (
              <li key={announcement.id}>
                <a
                  href={announcement.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-5 py-4 -mx-2 px-2 rounded-lg hover:bg-background-secondary transition-colors duration-200"
                >
                  {/* Date block */}
                  <div className="shrink-0 w-14 flex flex-col items-center justify-center text-center tabular-nums">
                    <span className="text-[10px] tracking-widest text-label-secondary/60">
                      {year}
                    </span>
                    <span className="text-lg font-semibold leading-none text-label-primary">
                      {month}
                      <span className="text-label-secondary/40">/</span>
                      {day}
                    </span>
                  </div>

                  {/* Divider */}
                  <span
                    aria-hidden
                    className="w-px self-stretch bg-border-primary"
                  />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-label-primary group-hover:text-accent-info transition-colors duration-200 line-clamp-2">
                      {announcement.title}
                    </p>
                    {relative && (
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        <span className="text-xs px-2 py-0.5 rounded-full border border-accent-info/30 text-accent-info bg-accent-info/5">
                          {relative}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* External link indicator */}
                  <span className="text-label-primary/20 group-hover:text-accent-info transition-all duration-200 shrink-0 text-sm group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                    ↗
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

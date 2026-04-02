import Link from "next/link";
import type { Metadata } from "next";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { getMacPages } from "@/lib/notion";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

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

export default async function MacPage() {
  const pages = await getMacPages();

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold tracking-tight text-label-primary">
        Mac サポート
      </h1>
      <p className="mb-8 text-label-secondary">
        {pages.length} 件のページ
      </p>

      {pages.length === 0 ? (
        <p className="text-center text-label-secondary">ページがありません</p>
      ) : (
        <ul className="space-y-4">
          {pages.map((page) => {
            const title = getTitle(page);
            const tags = getTags(page);
            const lastEdited = getLastEdited(page);
            const pageId = page.id.replace(/-/g, "");

            return (
              <li key={page.id}>
                <Link href={`/mac/${pageId}`} className="block">
                  <Card className="transition-shadow hover:shadow-md">
                    <CardHeader>
                      <CardTitle className="text-lg text-label-primary">{title}</CardTitle>
                      <CardDescription className="flex flex-wrap items-center gap-2">
                        {tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                        {lastEdited && (
                          <span className="text-xs text-label-secondary">
                            {lastEdited}
                          </span>
                        )}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

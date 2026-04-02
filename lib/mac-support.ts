import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

export function getMacPageTitle(page: PageObjectResponse): string {
  const prop = page.properties["ページ"];
  if (prop?.type === "title") {
    return prop.title.map((t) => t.plain_text).join("") || "無題";
  }
  return "無題";
}

export function getMacPageTags(page: PageObjectResponse): string[] {
  const prop = page.properties["タグ"];
  if (prop?.type === "multi_select") {
    return prop.multi_select.map((tag) => tag.name);
  }
  return [];
}

export function getMacPageLastEdited(page: PageObjectResponse): string {
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

export function getMacPageLastEditedISO(page: PageObjectResponse): string {
  const prop = page.properties["最終更新日時"];
  if (prop?.type === "last_edited_time") {
    return prop.last_edited_time;
  }
  return "";
}

import { api } from "@/lib/api";

export default async function Page() {
  const { data, error } = await api.GET("/v1/announcements");

  if (error || !data) {
    return (
      <>
        <h1>Announcements</h1>
        <p className="text-accent-error">お知らせの取得に失敗しました。</p>
      </>
    );
  }

  return (
    <>
      <h1>Announcements</h1>
      <ul>
        {data.announcements.map((announcement) => (
          <li key={announcement.id}>
            <a href={announcement.url}>{announcement.title}</a>
          </li>
        ))}
      </ul>
    </>
  );
}

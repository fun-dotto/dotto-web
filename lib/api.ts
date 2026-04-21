import createClient, { type Middleware } from "openapi-fetch";
import type { paths } from "@/types/api";

const authMiddleware: Middleware = {
  async onRequest({ request }) {
    if (typeof window === "undefined") {
      return request;
    }
    const { auth } = await import("@/lib/firebase");
    const token = await auth.currentUser?.getIdToken();
    if (token) {
      request.headers.set("Authorization", `Bearer ${token}`);
    }
    return request;
  },
};

export const api = createClient<paths>({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  querySerializer: {
    array: { style: "form", explode: false },
  },
});

api.use(authMiddleware);

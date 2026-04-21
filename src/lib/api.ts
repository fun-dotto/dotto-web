import createClient, { type Middleware } from "openapi-fetch";
import type { paths } from "@/types/api";

const authMiddleware: Middleware = {
  async onRequest({ request }) {
    if (typeof window === "undefined") {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      const token = cookieStore.get("firebase-id-token")?.value;
      if (token) {
        request.headers.set("Authorization", `Bearer ${token}`);
      }
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

const appCheckMiddleware: Middleware = {
  async onRequest({ request }) {
    if (typeof window === "undefined") {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      const token = cookieStore.get("firebase-app-check-token")?.value;
      if (token) {
        request.headers.set("X-Firebase-AppCheck", token);
      }
      return request;
    }
    const [{ appCheck }, { getToken }] = await Promise.all([
      import("@/lib/firebase"),
      import("firebase/app-check"),
    ]);
    if (!appCheck) {
      return request;
    }
    try {
      const { token } = await getToken(appCheck, false);
      if (token) {
        request.headers.set("X-Firebase-AppCheck", token);
      }
    } catch {
      // App Check failures should not block the request.
    }
    return request;
  },
};

const baseUrl =
  typeof window === "undefined"
    ? process.env.NEXT_PUBLIC_API_BASE_URL
    : "/api/bff";

export const api = createClient<paths>({
  baseUrl,
  querySerializer: {
    array: { style: "form", explode: false },
  },
});

api.use(appCheckMiddleware);
api.use(authMiddleware);

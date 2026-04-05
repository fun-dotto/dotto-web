const SW_VERSION = "v1";
const MAC_DOCUMENT_CACHE = `mac-documents-${SW_VERSION}`;
const STATIC_ASSET_CACHE = `static-assets-${SW_VERSION}`;

const CURRENT_CACHES = [MAC_DOCUMENT_CACHE, STATIC_ASSET_CACHE];

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((cacheName) => !CURRENT_CACHES.includes(cacheName))
          .map((cacheName) => caches.delete(cacheName))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  if (isMacNavigationRequest(request)) {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  if (isCacheableStaticAssetRequest(request)) {
    event.respondWith(networkFirstStaticAsset(request));
  }
});

function isMacNavigationRequest(request) {
  if (request.mode !== "navigate") return false;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return false;

  return url.pathname === "/mac" || url.pathname.startsWith("/mac/");
}

function isCacheableStaticAssetRequest(request) {
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return false;

  if (url.pathname.startsWith("/_next/static/")) return true;

  return ["script", "style", "font", "image"].includes(request.destination);
}

async function networkFirstNavigation(request) {
  const cache = await caches.open(MAC_DOCUMENT_CACHE);

  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    return new Response("オフラインです。接続後に再試行してください。", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=UTF-8" },
    });
  }
}

async function networkFirstStaticAsset(request) {
  const cache = await caches.open(STATIC_ASSET_CACHE);

  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    return new Response("", { status: 504 });
  }
}

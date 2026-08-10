// Stock Bloc Service Worker - Intel Feed & 5:00 AM EST Scheduled Background Sync
const CACHE_NAME = "stock-bloc-intel-cache-v1";
const YOUTUBE_FEED_API = "/api/intel/youtube-feed";

// Install Event - Pre-cache core shell
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        "/",
        "/index.html",
        YOUTUBE_FEED_API
      ]).catch(() => {
        // Soft fail on pre-cache
      });
    })
  );
});

// Activate Event - Clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Stale-While-Revalidate for /api/intel/youtube-feed
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (url.pathname === YOUTUBE_FEED_API) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        try {
          // Attempt network fetch first for real-time 5 AM update
          const networkResponse = await fetch(event.request);
          if (networkResponse && networkResponse.ok) {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          }
        } catch (err) {
          console.log("[SW] Network failed for YouTube feed, serving from cache:", err);
        }
        // Fallback to cached response
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) return cachedResponse;

        // Ultimate fallback
        return new Response(JSON.stringify({ error: "Offline - Feed not cached yet" }), {
          headers: { "Content-Type": "application/json" }
        });
      })
    );
    return;
  }

  // Default network request handling
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request);
    })
  );
});

// Periodic Background Sync Event (Supported in Chrome/Edge PWA)
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "sync-youtube-intel-5am") {
    console.log("[SW] Executing 5:00 AM EST Periodic YouTube Feed Sync...");
    event.waitUntil(fetchAndCacheYouTubeFeed());
  }
});

// Background Sync Event (One-shot retry trigger)
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-youtube-intel-now") {
    console.log("[SW] Executing One-shot Background Sync for YouTube Feed...");
    event.waitUntil(fetchAndCacheYouTubeFeed());
  }
});

async function fetchAndCacheYouTubeFeed() {
  try {
    const res = await fetch(YOUTUBE_FEED_API + "?force=true");
    if (res.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(YOUTUBE_FEED_API, res.clone());
      console.log("[SW] 5:00 AM EST YouTube Intel Feed successfully cached in background.");
    }
  } catch (err) {
    console.error("[SW] Background sync failed:", err);
  }
}

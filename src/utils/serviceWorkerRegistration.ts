// Registers Service Worker and sets up 5:00 AM EST Periodic Sync where supported

export function registerServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return;
  }

  // Unregister in development mode to prevent stale asset caching in iframe preview
  if (import.meta.env.DEV) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister();
      }
    }).catch(() => {
      // Ignore unregister errors in dev
    });
    return;
  }

  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });

      console.log("[Service Worker] Registered successfully with scope:", registration.scope);

      // Attempt to register Periodic Sync for 5:00 AM EST daily YouTube Sync if supported (PWA/Chrome)
      if ("periodicSync" in registration) {
        try {
          // Request permission for periodic background sync
          const status = await (navigator as any).permissions?.query({
            name: "periodic-background-sync",
          });

          if (status?.state === "granted" || status?.state === "prompt") {
            await (registration as any).periodicSync.register("sync-youtube-intel-5am", {
              minInterval: 24 * 60 * 60 * 1000, // 24 hours (triggers daily around 5 AM EST)
            });
            console.log("[Service Worker] Registered 'sync-youtube-intel-5am' periodic sync.");
          }
        } catch (err) {
          console.log("[Service Worker] Periodic sync registration info:", err);
        }
      }
    } catch (error) {
      console.warn("[Service Worker] Registration failed:", error);
    }
  });
}

export function triggerBackgroundSyncNow() {
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      if ("sync" in registration) {
        (registration as any).sync.register("sync-youtube-intel-now").catch(() => {
          // Background sync tag fallback
        });
      }
    });
  }
}

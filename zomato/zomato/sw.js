const CACHE_NAME = "zomato-cache-v1";
const OFFLINE_URL = "offline.php";
const CACHE_ASSETS = [
  "/",
  "/index.php",
  "/style.css",
  "/manifest.json",
  "/assets/logo.png",
  "/assets/hero.jpg",
  "/assets/burger.jpg",
  "/assets/pizza.jpg",
  "/assets/iceCream.jpg",
  "/assets/restaurant1.jpg",
  "/assets/restaurant2.jpg",
  "/assets/restaurant3.jpg",
  "/assets/restaurant4.jpg",
  "/assets/logo-192.png",
  "/assets/logo-512.png",
];

// Install event: Cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event: Clear old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event: Serve cached files or fallback to offline page
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).catch(() => caches.match(OFFLINE_URL));
    })
  );
});
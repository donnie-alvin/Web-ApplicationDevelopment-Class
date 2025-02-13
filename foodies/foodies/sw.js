self.addEventListener('install', function(event) {
  console.log('SW Installed');
  event.waitUntil(
    caches.open('static').then(function(cache) {
      console.log('Cache opened:', cache);
      return cache.addAll([
        "/",
        "./index.php",
        "./order.php",
        "./style.css",
        "./manifest.json",
        "./assets/logo.png",
        "./assets/hero.jpg",
        "./assets/burger.jpg",
        "./assets/pizza.jpg",
        "./assets/iceCream.jpg",
        "./assets/restaurant1.jpg",
        "./assets/restaurant2.jpg",
        "./assets/restaurant3.jpg",
        "./assets/restaurant4.jpg",
        "./assets/logotop.png"
      ]).catch(function(error) {
        console.error('Failed to cache assets:', error);
      });
    })
  );
});

self.addEventListener('activate', function(event) {
  console.log('SW Activated');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      console.log('Current caches:', cacheNames);
      return Promise.all(
        cacheNames.filter((name) => name !== 'static').map((name) => {
          console.log('Deleting cache:', name);
          return caches.delete(name);
        })
      );
    })
  );
  self.clients.claim(); // Take control of all clients immediately
});

self.addEventListener('fetch', function(event) {
  console.log('Fetching:', event.request.url);
  event.respondWith(
    fetch(event.request) // Attempt to fetch from the network first
      .then(function(response) {
        // If the response is valid, cache it for future use
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response; // If response is not valid, just return it
        }
        const responseToCache = response.clone(); // Clone the response
        caches.open('static').then(function(cache) {
          cache.put(event.request, responseToCache); // Cache the response
        });
        return response; // Return the network response
      })
      .catch(function() {
        // If the network request fails, try to get the response from the cache
        return caches.match(event.request).then(function(cachedResponse) {
          if (cachedResponse) {
            console.log('Serving from cache:', event.request.url);
            return cachedResponse; // Serve from cache if available
          }
          // If no cached response available, return a fallback (optional)
          console.error('No cached response found for:', event.request.url);
          return new Response('Offline and no cached response available', {
            status: 404,
            statusText: 'Not Found'
          });
        });
      })
  );
});
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 //self.addEventListener('install', function() {
  //console.log('SW Installed');
  //event.waitUntil(caches.open('static')
  //.then(function(cache) {
    //cache.addAll( [
      //"/",
      //"/index.php",
      //"/style.css",
      //"/manifest.json",
      //"/assets/logo.png",
      //"/assets/hero.jpg",
      //"/assets/burger.jpg",
      //"/assets/pizza.jpg",
      //"/assets/iceCream.jpg",
      //"/assets/restaurant1.jpg",
      //"/assets/restaurant2.jpg",
      //"/assets/restaurant3.jpg",
      //"/assets/restaurant4.jpg",
      //"/assets/logo-192.png",
      //"/assets/logo-512.png"
    //]);
  //})
//);
 //});
  

 //self.addEventListener('activate', function() {
  //console.log('SW Activated');
 //});

 //self.addEventListener('fetch', function(event) {
  //event.respondWith(
    //caches.match(event.request)
    //.then(function(res) {
      //if (res) {
        //return res;
      //} else {
        //return fetch(event.request);
      //}
    //})
  //);
 //});




































//const CACHE_NAME = "foodies-cache-v1";
//const OFFLINE_URL = "offline.php";
//const CACHE_ASSETS = [
  //"/",
  //"/index.php",
  //"/style.css",
  //"/manifest.json",
  //"/assets/logo.png",
  //"/assets/hero.jpg",
  //"/assets/burger.jpg",
  //"/assets/pizza.jpg",
  //"/assets/iceCream.jpg",
  //"/assets/restaurant1.jpg",
  //"/assets/restaurant2.jpg",
  //"/assets/restaurant3.jpg",
  //"/assets/restaurant4.jpg",
  //"/assets/logo-192.png",
  //"/assets/logo-512.png",
//];

// Install event: Cache static assets
//self.addEventListener("install", (event) => {
//  event.waitUntil(
//    caches.open(CACHE_NAME).then((cache) => {
//      return cache.addAll(CACHE_ASSETS);
//    })
//  );
//  self.skipWaiting();
//});

// Activate event: Clear old caches
//self.addEventListener("activate", (event) => {
//  event.waitUntil(
//    caches.keys().then((cacheNames) => {
//      return Promise.all(
//        cacheNames
//          .filter((name) => name !== CACHE_NAME)
//          .map((name) => caches.delete(name))
//      );
//    })
//  );
//  self.clients.claim();
//});

// Fetch event: Serve cached files or fallback to offline page
//self.addEventListener("fetch", (event) => {
//  event.respondWith(
//    caches.match(event.request).then((response) => {
//      return response || fetch(event.request).catch(() => caches.match(OFFLINE_URL));
//    })
//  );
//});
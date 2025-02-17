// Cache names and assets configuration
const STATIC_CACHE = 'static-cache-v1';
const DYNAMIC_CACHE = 'dynamic-cache-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.php',
    '/order.php',
    '/app.html',
    '/app.js',
    '/style.css',
    '/manifest.json',
    '/assets/logo.png',
    '/assets/logotop.png',
    '/assets/hero.jpg',
    '/assets/burger.jpg',
    '/assets/pizza.jpg',
    '/assets/iceCream.jpg',
    '/assets/restaurant1.jpg',
    '/assets/restaurant2.jpg',
    '/assets/restaurant3.jpg',
    '/assets/restaurant4.jpg',
    '/assets/logo-192.png',
    '/assets/logo-512.png'
];

// Install event handler
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('Service Worker: Caching static assets');
                return cache.addAll(ASSETS_TO_CACHE)
                    .then(() => console.log('All assets cached successfully'))
                    .catch(error => console.error('Cache addAll error:', error));
            })
            .then(() => self.skipWaiting()) // Activate new SW immediately
    );
});

// Activate event handler
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        Promise.all([
            // Clean up old caches
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(cacheName => 
                            cacheName !== STATIC_CACHE && 
                            cacheName !== DYNAMIC_CACHE
                        )
                        .map(cacheName => {
                            console.log('Service Worker: Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        })
                );
            }),
            // Take control of all clients immediately
            self.clients.claim()
        ])
    );
});

// Fetch event handler with improved caching strategy
self.addEventListener('fetch', (event) => {
    console.log('Service Worker: Fetching:', event.request.url);

    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    // Handle API requests differently
    if (event.request.url.includes('/api/')) {
        handleApiRequest(event);
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                // Return cached response if available
                if (cachedResponse) {
                    console.log('Service Worker: Serving from cache:', event.request.url);
                    
                    // Fetch and cache update in background (cache-first with refresh)
                    updateCache(event.request);
                    
                    return cachedResponse;
                }

                // If not in cache, fetch from network
                return fetchAndCache(event.request);
            })
            .catch(() => {
                // Return offline fallback for navigation requests
                if (event.request.mode === 'navigate') {
                    return caches.match('/offline.html');
                }
                
                // Return error response for other requests
                return new Response(
                    'Network error occurred',
                    {
                        status: 503,
                        statusText: 'Service Unavailable',
                        headers: new Headers({
                            'Content-Type': 'text/plain'
                        })
                    }
                );
            })
    );
});

// Helper function to fetch and cache
async function fetchAndCache(request) {
    try {
        const response = await fetch(request);
        
        // Only cache valid responses
        if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
        }

        // Clone the response before caching
        const responseToCache = response.clone();
        
        // Cache in dynamic cache
        const cache = await caches.open(DYNAMIC_CACHE);
        await cache.put(request, responseToCache);
        
        return response;
    } catch (error) {
        console.error('Fetch and cache error:', error);
        throw error;
    }
}

// Helper function to update cache in background
async function updateCache(request) {
    try {
        const response = await fetch(request);
        
        if (!response || response.status !== 200 || response.type !== 'basic') {
            return;
        }

        const cache = await caches.open(DYNAMIC_CACHE);
        await cache.put(request, response);
    } catch (error) {
        console.error('Cache update error:', error);
    }
}

// Handle API requests
function handleApiRequest(event) {
    event.respondWith(
        fetch(event.request)
            .catch(error => {
                console.error('API request failed:', error);
                return new Response(
                    JSON.stringify({ error: 'Network connection failed' }),
                    {
                        status: 503,
                        headers: { 'Content-Type': 'application/json' }
                    }
                );
            })
    );
}

// Listen for messages from clients
self.addEventListener('message', (event) => {
    if (event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
});

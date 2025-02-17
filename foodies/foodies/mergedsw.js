/**
 * Service Worker Configuration
 * Handles caching, offline functionality, and resource management
 */

// Cache configuration
const STATIC_CACHE = 'static-cache-v1';  // Cache for static assets
const DYNAMIC_CACHE = 'dynamic-cache-v1'; // Cache for dynamic content
const APP_VERSION = '1.0.0';             // Application version for cache management

// List of assets to cache on installation
const ASSETS_TO_CACHE = [
    '/',
    '/index.php',
    '/order.php',
    '/app.html',
    '/app.js',
    '/style.css',
    '/manifest.json',
    // Image assets
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

/**
 * Utility function to send messages to all clients
 * @param {Object} message - Message to send to clients
 */
async function sendMessageToClients(message) {
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
        client.postMessage(message);
    });
}

/**
 * Installation Event Handler
 * Caches static assets and prepares service worker for use
 */
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker: Installation Started');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                sendMessageToClients({
                    type: 'INSTALL_PROGRESS',
                    message: 'Caching static assets...'
                });
                
                return cache.addAll(ASSETS_TO_CACHE)
                    .then(() => {
                        console.log('✅ All assets cached successfully');
                        sendMessageToClients({
                            type: 'INSTALL_SUCCESS',
                            message: 'Application assets cached successfully'
                        });
                    })
                    .catch(error => {
                        console.error('❌ Cache installation failed:', error);
                        sendMessageToClients({
                            type: 'INSTALL_ERROR',
                            message: 'Failed to cache assets: ' + error.message
                        });
                        throw error;
                    });
            })
            .then(() => self.skipWaiting())
    );
});

/**
 * Activation Event Handler
 * Cleans up old caches and takes control of clients
 */
self.addEventListener('activate', (event) => {
    console.log('🔄 Service Worker: Activation Started');
    
    event.waitUntil(
        Promise.all([
            // Clean up old caches
            caches.keys().then(cacheNames => {
                sendMessageToClients({
                    type: 'ACTIVATE_PROGRESS',
                    message: 'Cleaning old caches...'
                });
                
                return Promise.all(
                    cacheNames
                        .filter(cacheName => 
                            cacheName !== STATIC_CACHE && 
                            cacheName !== DYNAMIC_CACHE
                        )
                        .map(cacheName => {
                            console.log('🗑️ Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        })
                );
            }),
            self.clients.claim()
        ]).then(() => {
            sendMessageToClients({
                type: 'ACTIVATE_SUCCESS',
                message: 'Service Worker activated and ready'
            });
        }).catch(error => {
            console.error('❌ Activation failed:', error);
            sendMessageToClients({
                type: 'ACTIVATE_ERROR',
                message: 'Service Worker activation failed: ' + error.message
            });
        })
    );
});

/**
 * Fetch Event Handler
 * Manages network requests and implements caching strategy
 */
self.addEventListener('fetch', (event) => {
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
                if (cachedResponse) {
                    // Serve from cache and update in background
                    updateCache(event.request);
                    sendMessageToClients({
                        type: 'CACHE_HIT',
                        message: 'Serving from cache: ' + event.request.url
                    });
                    return cachedResponse;
                }

                // Fetch from network
                return fetchAndCache(event.request);
            })
            .catch(() => {
                if (event.request.mode === 'navigate') {
                    sendMessageToClients({
                        type: 'OFFLINE_MODE',
                        message: 'Loading offline page'
                    });
                    return caches.match('/offline.html');
                }
                
                sendMessageToClients({
                    type: 'NETWORK_ERROR',
                    message: 'Failed to fetch resource'
                });
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

/**
 * Fetches and caches a resource
 * @param {Request} request - The request to fetch and cache
 */
async function fetchAndCache(request) {
    try {
        const response = await fetch(request);
        
        if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
        }

        const responseToCache = response.clone();
        const cache = await caches.open(DYNAMIC_CACHE);
        await cache.put(request, responseToCache);
        
        sendMessageToClients({
            type: 'CACHE_UPDATE',
            message: 'Resource cached: ' + request.url
        });
        
        return response;
    } catch (error) {
        console.error('❌ Fetch and cache error:', error);
        sendMessageToClients({
            type: 'CACHE_ERROR',
            message: 'Failed to fetch and cache: ' + error.message
        });
        throw error;
    }
}

/**
 * Updates cached resource in background
 * @param {Request} request - The request to update in cache
 */
async function updateCache(request) {
    try {
        const response = await fetch(request);
        
        if (!response || response.status !== 200 || response.type !== 'basic') {
            return;
        }

        const cache = await caches.open(DYNAMIC_CACHE);
        await cache.put(request, response);
        
        sendMessageToClients({
            type: 'CACHE_UPDATED',
            message: 'Cache updated in background'
        });
    } catch (error) {
        console.error('❌ Cache update error:', error);
        sendMessageToClients({
            type: 'UPDATE_ERROR',
            message: 'Failed to update cache: ' + error.message
        });
    }
}

/**
 * Handles API requests separately
 * @param {FetchEvent} event - The fetch event for API requests
 */
function handleApiRequest(event) {
    event.respondWith(
        fetch(event.request)
            .then(response => {
                sendMessageToClients({
                    type: 'API_SUCCESS',
                    message: 'API request successful'
                });
                return response;
            })
            .catch(error => {
                console.error('❌ API request failed:', error);
                sendMessageToClients({
                    type: 'API_ERROR',
                    message: 'API request failed: ' + error.message
                });
                return new Response(
                    JSON.stringify({ 
                        error: 'Network connection failed',
                        details: error.message
                    }),
                    {
                        status: 503,
                        headers: { 'Content-Type': 'application/json' }
                    }
                );
            })
    );
}

/**
 * Message Event Handler
 * Handles messages from clients
 */
self.addEventListener('message', (event) => {
    if (event.data.action === 'skipWaiting') {
        self.skipWaiting();
        sendMessageToClients({
            type: 'UPDATE_READY',
            message: 'New version ready to activate'
        });
    }
});

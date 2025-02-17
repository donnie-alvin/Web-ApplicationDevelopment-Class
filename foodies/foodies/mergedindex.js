// Database configuration
const DB_NAME = 'foodOrderDB';
const DB_VERSION = 1;
const STORE_NAME = 'orders';

let db = null;
let deferredPrompt;

// Service Worker Registration with improved error handling
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('Service Worker registered successfully:', registration.scope);
            })
            .catch(error => {
                console.error('Service Worker registration failed:', error);
            });
    });
}

// Initialize database
function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            db = event.target.result;
            
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, {
                    keyPath: 'id',
                    autoIncrement: true
                });
                
                // Create useful indexes
                store.createIndex('timestamp', 'timestamp', { unique: false });
                store.createIndex('status', 'status', { unique: false });
            }
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            resolve(db);
        };

        request.onerror = (event) => {
            console.error('Database error:', event.target.error);
            reject(event.target.error);
        };
    });
}

// Add order entry to database
async function addEntry(orderData) {
    if (!db) await initDB();
    
    const entry = {
        ...orderData,
        timestamp: Date.now(),
        status: 'pending',
        synced: false
    };

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        
        const request = store.add(entry);
        
        request.onsuccess = () => {
            console.log('Order added:', request.result);
            resolve(request.result);
        };
        
        request.onerror = (event) => {
            console.error('Add error:', event.target.error);
            reject(event.target.error);
        };
    });
}

// Get all entries from database
async function getAllEntries() {
    if (!db) await initDB();
    
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const output = document.getElementById('output');
        
        const request = store.getAll();
        
        request.onsuccess = (event) => {
            const entries = event.target.result;
            if (output) {
                output.innerHTML = entries.map(entry => 
                    `<div class="order-entry">
                        <p>Order ID: ${entry.id}</p>
                        <p>Date: ${new Date(entry.timestamp).toLocaleString()}</p>
                        <p>Status: ${entry.status}</p>
                        <p>Items: ${JSON.stringify(entry.items)}</p>
                    </div>`
                ).join('');
            }
            resolve(entries);
        };
        
        request.onerror = (event) => {
            console.error('Get error:', event.target.error);
            reject(event.target.error);
        };
    });
}

// Clear database
async function clearDatabase() {
    if (!db) await initDB();
    
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        
        const request = store.clear();
        
        request.onsuccess = () => {
            console.log('Database cleared');
            const output = document.getElementById('output');
            if (output) output.innerHTML = '';
            resolve();
        };
        
        request.onerror = (event) => {
            console.error('Clear error:', event.target.error);
            reject(event.target.error);
        };
    });
}

// Sync orders when online
async function syncOrders() {
    if (!navigator.onLine) return;
    
    try {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const unsynced = await store.index('status').getAll('pending');
        
        for (const order of unsynced) {
            try {
                // Simulate API call to sync order
                await fetch('/api/orders', {
                    method: 'POST',
                    body: JSON.stringify(order),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                // Update order status
                const updateTx = db.transaction(STORE_NAME, 'readwrite');
                const updateStore = updateTx.objectStore(STORE_NAME);
                order.status = 'synced';
                await updateStore.put(order);
                
            } catch (error) {
                console.error('Error syncing order:', error);
            }
        }
    } catch (error) {
        console.error('Error in sync process:', error);
    }
}

// Listen for online status
window.addEventListener('online', syncOrders);

// PWA installation handling
window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    
    // Show install button if it exists
    const installButton = document.getElementById('install-button');
    if (installButton) {
        installButton.style.display = 'block';
        installButton.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                console.log(`User ${outcome === 'accepted' ? 'accepted' : 'dismissed'} the install prompt`);
                deferredPrompt = null;
            }
        });
    }
});

window.addEventListener('appinstalled', () => {
    console.log('PWA installed successfully');
});

// Initialize database when app starts
(async function initialize() {
    try {
        await initDB();
        console.log('Database initialized successfully');
        if (navigator.onLine) {
            await syncOrders();
        }
    } catch (error) {
        console.error('Initialization failed:', error);
    }
})();

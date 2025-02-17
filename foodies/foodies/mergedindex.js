// Database configuration
const DB_NAME = 'foodOrderDB';
const DB_VERSION = 1;
const STORE_NAME = 'orders';

let db = null;
let deferredPrompt;

/**
 * Notification System
 * Handles displaying notifications to users
 */
class NotificationSystem {
    static show(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="message">${message}</span>
                <button class="close-btn">&times;</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Add close button functionality
        const closeBtn = notification.querySelector('.close-btn');
        closeBtn.addEventListener('click', () => notification.remove());
        
        // Auto-remove after 5 seconds
        setTimeout(() => notification.remove(), 5000);
    }
}

// Add notification styles
const style = document.createElement('style');
style.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px;
        border-radius: 5px;
        z-index: 1000;
        animation: slideIn 0.5s ease-out;
    }
    
    .notification.success {
        background-color: #4CAF50;
        color: white;
    }
    
    .notification.error {
        background-color: #f44336;
        color: white;
    }
    
    .notification.info {
        background-color: #2196F3;
        color: white;
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    
    .close-btn {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        margin-left: 10px;
    }
    
    @keyframes slideIn {
        from { transform: translateX(100%); }
        to { transform: translateX(0); }
    }
`;
document.head.appendChild(style);

/**
 * Service Worker Registration and Message Handling
 */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            NotificationSystem.show('Service Worker registered successfully', 'success');
            console.log('Service Worker registered:', registration.scope);
        } catch (error) {
            NotificationSystem.show('Service Worker registration failed', 'error');
            console.error('Service Worker registration failed:', error);
        }
    });

    // Listen for Service Worker messages
    navigator.serviceWorker.addEventListener('message', (event) => {
        const { type, message } = event.data;
        
        switch(type) {
            case 'INSTALL_SUCCESS':
            case 'ACTIVATE_SUCCESS':
            case 'CACHE_UPDATED':
                NotificationSystem.show(message, 'success');
                break;
                
            case 'INSTALL_ERROR':
            case 'ACTIVATE_ERROR':
            case 'NETWORK_ERROR':
            case 'API_ERROR':
                NotificationSystem.show(message, 'error');
                break;
                
            case 'OFFLINE_MODE':
                NotificationSystem.show('You are currently offline. Some features may be limited.', 'info');
                break;
        }
    });
}

/**
 * IndexedDB Functions
 */
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
                
                store.createIndex('timestamp', 'timestamp', { unique: false });
                store.createIndex('status', 'status', { unique: false });
                NotificationSystem.show('Database schema updated', 'info');
            }
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            NotificationSystem.show('Database connected successfully', 'success');
            resolve(db);
        };

        request.onerror = (event) => {
            const error = event.target.error;
            NotificationSystem.show('Database connection failed', 'error');
            console.error('Database error:', error);
            reject(error);
        };
    });
}

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
            NotificationSystem.show('Order added successfully', 'success');
            resolve(request.result);
        };
        
        request.onerror = (event) => {
            NotificationSystem.show('Failed to add order', 'error');
            reject(event.target.error);
        };
    });
}

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
                output.innerHTML = entries.map(entry => `
                    <div class="order-entry">
                        <p>Order ID: ${entry.id}</p>
                        <p>Date: ${new Date(entry.timestamp).toLocaleString()}</p>
                        <p>Status: ${entry.status}</p>
                        <p>Items: ${JSON.stringify(entry.items)}</p>
                    </div>
                `).join('');
                NotificationSystem.show('Orders loaded successfully', 'success');
            }
            resolve(entries);
        };
        
        request.onerror = (event) => {
            NotificationSystem.show('Failed to load orders', 'error');
            reject(event.target.error);
        };
    });
}

async function clearDatabase() {
    if (!db) await initDB();
    
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        
        const request = store.clear();
        
        request.onsuccess = () => {
            const output = document.getElementById('output');
            if (output) output.innerHTML = '';
            NotificationSystem.show('Database cleared successfully', 'success');
            resolve();
        };
        
        request.onerror = (event) => {
            NotificationSystem.show('Failed to clear database', 'error');
            reject(event.target.error);
        };
    });
}

async function syncOrders() {
    if (!navigator.onLine) {
        NotificationSystem.show('Cannot sync orders while offline', 'info');
        return;
    }
    
    try {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const unsynced = await store.index('status').getAll('pending');
        
        for (const order of unsynced) {
            try {
                await fetch('/api/orders', {
                    method: 'POST',
                    body: JSON.stringify(order),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                const updateTx = db.transaction(STORE_NAME, 'readwrite');
                const updateStore = updateTx.objectStore(STORE_NAME);
                order.status = 'synced';
                await updateStore.put(order);
                NotificationSystem.show(`Order #${order.id} synced successfully`, 'success');
                
            } catch (error) {
                NotificationSystem.show(`Failed to sync order #${order.id}`, 'error');
                console.error('Error syncing order:', error);
            }
        }
    } catch (error) {
        NotificationSystem.show('Error in sync process', 'error');
        console.error('Error in sync process:', error);
    }
}

// Event Listeners
window.addEventListener('online', () => {
    NotificationSystem.show('Connection restored', 'success');
    syncOrders();
});

window.addEventListener('offline', () => {
    NotificationSystem.show('You are offline', 'info');
});

// PWA Installation
window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    
    const installButton = document.getElementById('install-button');
    if (installButton) {
        installButton.style.display = 'block';
        installButton.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                NotificationSystem.show(
                    `Installation ${outcome === 'accepted' ? 'successful' : 'cancelled'}`,
                    outcome === 'accepted' ? 'success' : 'info'
                );
                deferredPrompt = null;
            }
        });
    }
});

window.addEventListener('appinstalled', () => {
    NotificationSystem.show('Application installed successfully', 'success');
});

// Initialize application
(async function initialize() {
    try {
        await initDB();
        if (navigator.onLine) {
            await syncOrders();
        }
    } catch (error) {
        NotificationSystem.show('Failed to initialize application', 'error');
        console.error('Initialization failed:', error);
    }
})();

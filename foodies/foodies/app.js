// Database configuration
const DB_NAME = 'offlineDB';
const DB_VERSION = 1;
const STORE_NAME = 'entries';

let db = null;

// Initialize database
function initDB() {
    return new Promise((resolve, reject) => {
        // Open or create database
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        // Handle database upgrades (schema changes)
        request.onupgradeneeded = (event) => {
            db = event.target.result;
            
            // Create object store if it doesn't exist
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, {
                    keyPath: 'id',
                    autoIncrement: true
                });
                
                // Create indexes (optional)
                store.createIndex('timestamp', 'timestamp', { unique: false });
            }
        };

        // Handle successful opening
        request.onsuccess = (event) => {
            db = event.target.result;
            resolve(db);
        };

        // Handle errors
        request.onerror = (event) => {
            console.error('Database error:', event.target.error);
            reject(event.target.error);
        };
    });
}

// Add entry to database
async function addEntry() {
    if (!db) await initDB();
    
    const entry = {
        data: `Entry at ${new Date().toLocaleTimeString()}`,
        timestamp: Date.now()
    };

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        
        const request = store.add(entry);
        
        request.onsuccess = () => {
            console.log('Entry added:', request.result);
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
            output.innerHTML = entries.map(entry => 
                `<p>ID: ${entry.id} - ${entry.data}</p>`
            ).join('');
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
            document.getElementById('output').innerHTML = '';
            resolve();
        };
        
        request.onerror = (event) => {
            console.error('Clear error:', event.target.error);
            reject(event.target.error);
        };
    });
}

// Initialize database when app starts
(async function initialize() {
    try {
        await initDB();
        console.log('Database initialized');
    } catch (error) {
        console.error('Initialization failed:', error);
    }
})();

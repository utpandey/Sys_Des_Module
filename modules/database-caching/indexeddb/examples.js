/**
 * IndexedDB - Vanilla JS & React Examples
 * Includes both raw API and wrapper (idb) patterns
 */

/* ============================================
   VANILLA JS - RAW IndexedDB API
   ============================================ */

/**
 * 1. Database Manager (Raw API)
 * 
 * The raw API uses events (old school). Understanding it helps
 * you debug issues even when using wrappers.
 */
class IndexedDBManager {
  constructor(dbName, version = 1) {
    this.dbName = dbName;
    this.version = version;
    this.db = null;
  }

  async open(upgradeCallback) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      // Fires ONLY when version increases or DB is new
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        const oldVersion = event.oldVersion;
        
        if (upgradeCallback) {
          upgradeCallback(db, oldVersion, event.target.transaction);
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        
        // Handle version change from another tab
        this.db.onversionchange = () => {
          this.db.close();
          console.warn('Database outdated. Please reload.');
          // Optionally: window.location.reload();
        };
        
        resolve(this.db);
      };

      request.onerror = (event) => {
        reject(new Error(`IndexedDB error: ${event.target.error}`));
      };

      request.onblocked = () => {
        console.warn('Database upgrade blocked. Close other tabs.');
      };
    });
  }

  async add(storeName, data) {
    return this._transaction(storeName, 'readwrite', (store) => {
      return store.add(data);
    });
  }

  async put(storeName, data) {
    return this._transaction(storeName, 'readwrite', (store) => {
      return store.put(data);
    });
  }

  async get(storeName, key) {
    return this._transaction(storeName, 'readonly', (store) => {
      return store.get(key);
    });
  }

  async getAll(storeName) {
    return this._transaction(storeName, 'readonly', (store) => {
      return store.getAll();
    });
  }

  async delete(storeName, key) {
    return this._transaction(storeName, 'readwrite', (store) => {
      return store.delete(key);
    });
  }

  async getByIndex(storeName, indexName, value) {
    return this._transaction(storeName, 'readonly', (store) => {
      const index = store.index(indexName);
      return index.getAll(value);
    });
  }

  // Private helper: wraps IDB request in Promise
  _transaction(storeName, mode, callback) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, mode);
      const store = transaction.objectStore(storeName);
      const request = callback(store);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  close() {
    if (this.db) this.db.close();
  }
}

// Usage:
async function rawAPIExample() {
  const db = new IndexedDBManager('myApp', 2);

  await db.open((database, oldVersion, transaction) => {
    // Version 1: Create initial stores
    if (oldVersion < 1) {
      const userStore = database.createObjectStore('users', { keyPath: 'id' });
      userStore.createIndex('email', 'email', { unique: true });
      userStore.createIndex('role', 'role', { unique: false });
    }
    
    // Version 2: Add new store
    if (oldVersion < 2) {
      const postStore = database.createObjectStore('posts', { 
        keyPath: 'id', 
        autoIncrement: true 
      });
      postStore.createIndex('userId', 'userId', { unique: false });
      postStore.createIndex('createdAt', 'createdAt', { unique: false });
    }
  });

  // CRUD operations
  await db.put('users', { id: 1, name: 'John', email: 'john@test.com', role: 'admin' });
  await db.put('users', { id: 2, name: 'Jane', email: 'jane@test.com', role: 'user' });

  const user = await db.get('users', 1);
  const admins = await db.getByIndex('users', 'role', 'admin');
  const allUsers = await db.getAll('users');

  console.log('User:', user);
  console.log('Admins:', admins);
  console.log('All users:', allUsers);
}


/**
 * 2. Using `idb` wrapper library (RECOMMENDED for production)
 * 
 * npm install idb
 * Much cleaner API with Promises
 */
// import { openDB, deleteDB } from 'idb';

async function idbWrapperExample() {
  // Simulating idb library API
  const openDB = async (name, version, { upgrade }) => {
    // This would be imported from 'idb'
    // Returns a proper Promise-based DB wrapper
  };

  /*
  const db = await openDB('myApp', 2, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        const store = db.createObjectStore('users', { keyPath: 'id' });
        store.createIndex('email', 'email', { unique: true });
      }
      if (oldVersion < 2) {
        db.createObjectStore('cache', { keyPath: 'url' });
      }
    }
  });

  // Clean, promise-based API:
  await db.put('users', { id: 1, name: 'John', email: 'john@test.com' });
  const user = await db.get('users', 1);
  const allUsers = await db.getAll('users');
  await db.delete('users', 1);

  // Use transactions for multiple operations
  const tx = db.transaction('users', 'readwrite');
  await Promise.all([
    tx.store.put({ id: 1, name: 'John Updated' }),
    tx.store.put({ id: 2, name: 'Jane' }),
    tx.done // Wait for transaction to complete
  ]);

  // Use indexes
  const byEmail = await db.getFromIndex('users', 'email', 'john@test.com');
  */
}


/**
 * 3. Offline Data Sync Pattern
 * 
 * ✅ Senior pattern: Queue changes offline, sync when online
 */
class OfflineSyncManager {
  constructor(dbManager) {
    this.db = dbManager;
    this.SYNC_STORE = 'sync_queue';
    this.setupOnlineListener();
  }

  // Queue an action when offline
  async queueAction(action) {
    await this.db.add(this.SYNC_STORE, {
      ...action,
      timestamp: Date.now(),
      status: 'pending'
    });
  }

  // Sync all pending actions
  async syncAll() {
    const pending = await this.db.getAll(this.SYNC_STORE);
    const sortedByTime = pending
      .filter(a => a.status === 'pending')
      .sort((a, b) => a.timestamp - b.timestamp);

    for (const action of sortedByTime) {
      try {
        await this.processAction(action);
        await this.db.delete(this.SYNC_STORE, action.id);
      } catch (error) {
        console.error('Sync failed for action:', action, error);
        // Mark as failed, will retry next time
        await this.db.put(this.SYNC_STORE, { 
          ...action, 
          status: 'failed',
          error: error.message 
        });
      }
    }
  }

  async processAction(action) {
    const response = await fetch(action.url, {
      method: action.method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(action.data)
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }

  setupOnlineListener() {
    window.addEventListener('online', () => {
      console.log('Back online — syncing...');
      this.syncAll();
    });
  }
}


/**
 * 4. Blob/File Storage
 * 
 * ✅ IndexedDB can store binary data efficiently
 */
async function storeFile(dbManager, file) {
  await dbManager.put('files', {
    id: file.name,
    blob: file, // IndexedDB stores Blobs natively
    type: file.type,
    size: file.size,
    lastModified: file.lastModified,
    storedAt: Date.now()
  });
}

async function getFileAsURL(dbManager, fileName) {
  const record = await dbManager.get('files', fileName);
  if (!record) return null;
  return URL.createObjectURL(record.blob);
  // Don't forget: URL.revokeObjectURL(url) when done!
}


/* ============================================
   REACT EXAMPLES
   ============================================ */

/**
 * 5. useIndexedDB Hook
 */
function useIndexedDB(dbName, storeName, version = 1) {
  const dbRef = React.useRef(null);
  const [isReady, setIsReady] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const manager = new IndexedDBManager(dbName, version);
    
    manager.open((db, oldVersion) => {
      if (oldVersion < 1) {
        db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
      }
    })
    .then(() => {
      dbRef.current = manager;
      setIsReady(true);
    })
    .catch(setError);

    return () => manager.close();
  }, [dbName, storeName, version]);

  const add = React.useCallback(async (data) => {
    if (!dbRef.current) throw new Error('DB not ready');
    return dbRef.current.add(storeName, data);
  }, [storeName]);

  const put = React.useCallback(async (data) => {
    if (!dbRef.current) throw new Error('DB not ready');
    return dbRef.current.put(storeName, data);
  }, [storeName]);

  const get = React.useCallback(async (key) => {
    if (!dbRef.current) throw new Error('DB not ready');
    return dbRef.current.get(storeName, key);
  }, [storeName]);

  const getAll = React.useCallback(async () => {
    if (!dbRef.current) throw new Error('DB not ready');
    return dbRef.current.getAll(storeName);
  }, [storeName]);

  const remove = React.useCallback(async (key) => {
    if (!dbRef.current) throw new Error('DB not ready');
    return dbRef.current.delete(storeName, key);
  }, [storeName]);

  return { add, put, get, getAll, remove, isReady, error };
}

// Usage:
// function TodoList() {
//   const { getAll, add, remove, isReady } = useIndexedDB('todoApp', 'todos');
//   const [todos, setTodos] = React.useState([]);
//
//   React.useEffect(() => {
//     if (isReady) getAll().then(setTodos);
//   }, [isReady]);
//
//   const addTodo = async (text) => {
//     const id = await add({ text, done: false, createdAt: Date.now() });
//     setTodos(await getAll());
//   };
// }


console.log('See README.md for documentation');

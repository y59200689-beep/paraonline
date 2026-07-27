// ─── Browser Persistent Storage for Gallery Overrides (IndexedDB + localStorage fallback) ──
// Uses IndexedDB to store base64 Data URLs & custom image URLs without hitting 5MB localStorage quota limits.

const DB_NAME = 'para_gallery_db';
const STORE_NAME = 'overrides';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'));
    }
    const req = window.indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function setGalleryOverride(key: string, url: string): Promise<void> {
  // 1. Save to IndexedDB (unlimited capacity for high-res base64 images)
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(url, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn('[gallery-storage] IndexedDB write failed:', e);
  }

  // 2. Save to localStorage as secondary cache
  if (typeof window !== 'undefined') {
    try {
      const existing = JSON.parse(localStorage.getItem('custom_gallery_overrides') || '{}');
      existing[key] = url;
      localStorage.setItem('custom_gallery_overrides', JSON.stringify(existing));
    } catch (e) {
      console.warn('[gallery-storage] localStorage quota exceeded, IndexedDB retained override:', e);
    }
    window.dispatchEvent(new Event('gallery_overrides_updated'));
  }
}

export async function getGalleryOverrides(): Promise<Record<string, string>> {
  const result: Record<string, string> = {};

  // 1. Read from localStorage
  if (typeof window !== 'undefined') {
    try {
      const stored = JSON.parse(localStorage.getItem('custom_gallery_overrides') || '{}');
      Object.assign(result, stored);
    } catch {}
  }

  // 2. Read from IndexedDB (overrides localStorage with complete data)
  try {
    const db = await openDb();
    const idbData = await new Promise<Record<string, string>>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.openCursor();
      const records: Record<string, string> = {};
      req.onsuccess = () => {
        const cursor = req.result;
        if (cursor) {
          records[cursor.key as string] = cursor.value as string;
          cursor.continue();
        } else {
          resolve(records);
        }
      };
      req.onerror = () => reject(req.error);
    });
    Object.assign(result, idbData);
  } catch {}

  return result;
}

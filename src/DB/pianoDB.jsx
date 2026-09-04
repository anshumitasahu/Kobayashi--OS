const DB_NAME = 'pianoDB';
const SONGS_STORE = 'songs';
const META_STORE = 'meta';

const openDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(SONGS_STORE)) {
                db.createObjectStore(SONGS_STORE, { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains(META_STORE)) {
                db.createObjectStore(META_STORE, { keyPath: 'key' });
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

export const getAllSongs = async () => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(SONGS_STORE, 'readonly');
        const request = tx.objectStore(SONGS_STORE).getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
    });
};

export const saveSong = async (song) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(SONGS_STORE, 'readwrite');
        const request = tx.objectStore(SONGS_STORE).put(song);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

export const deleteSongById = async (id) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(SONGS_STORE, 'readwrite');
        const request = tx.objectStore(SONGS_STORE).delete(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

export const getMeta = async (key) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(META_STORE, 'readonly');
        const request = tx.objectStore(META_STORE).get(key);
        request.onsuccess = () => resolve(request.result ? request.result.value : null);
        request.onerror = () => reject(request.error);
    });
};

export const setMeta = async (key, value) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(META_STORE, 'readwrite');
        const request = tx.objectStore(META_STORE).put({ key, value });
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

const DB_NAME = "kobayashiDB";
const STORE_NAME = "memories";
const MAX_MEMORIES = 30;

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function loadMemories() {
    try {
        const db = await openDB();
        return new Promise((resolve) => {
            const tx = db.transaction(STORE_NAME, "readonly");
            const store = tx.objectStore(STORE_NAME);
            const request = store.getAll();
            request.onsuccess = () => resolve((request.result || []).sort((a, b) => a.id - b.id));
            request.onerror = () => resolve([]);
        });
    } catch {
        return [];
    }
}

function normalizeText(text) {
    return String(text || "").trim();
}

export async function saveMemories(newFacts) {
    const facts = (Array.isArray(newFacts) ? newFacts : [newFacts])
        .map(normalizeText)
        .filter((f) => f.length > 1 && f.length <= 300);
    if (facts.length === 0) return loadMemories();

    try {
        const existing = await loadMemories();
        const seen = new Set(existing.map((m) => m.text.trim().toLowerCase()));
        const fresh = facts.filter((f) => !seen.has(f.toLowerCase()));
        if (fresh.length === 0) return existing;

        const db = await openDB();
        await new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, "readwrite");
            const store = tx.objectStore(STORE_NAME);
            for (const text of fresh) {
                store.add({ text, createdAt: new Date().toISOString() });
            }
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });

        let all = await loadMemories();
        if (all.length > MAX_MEMORIES) {
            const overflow = all.slice(0, all.length - MAX_MEMORIES);
            const kept = all.slice(all.length - MAX_MEMORIES);
            const db2 = await openDB();
            await new Promise((resolve) => {
                const tx = db2.transaction(STORE_NAME, "readwrite");
                const store = tx.objectStore(STORE_NAME);
                for (const m of overflow) store.delete(m.id);
                tx.oncomplete = () => resolve();
                tx.onerror = () => resolve();
            });
            all = kept;
        }
        return all;
    } catch {
        return loadMemories();
    }
}

export async function deleteMemory(id) {
    try {
        const db = await openDB();
        await new Promise((resolve) => {
            const tx = db.transaction(STORE_NAME, "readwrite");
            tx.objectStore(STORE_NAME).delete(id);
            tx.oncomplete = () => resolve();
            tx.onerror = () => resolve();
        });
    } catch {
        /* noop */
    }
    return loadMemories();
}

export function formatMemoriesForPrompt(memories) {
    if (!memories || memories.length === 0) return "None yet.";
    return memories.map((m) => `- ${m.text}`).join("\n");
}

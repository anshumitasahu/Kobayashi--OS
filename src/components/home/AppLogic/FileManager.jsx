import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

const DB_NAME = "file-manager";
const STORE_NAME = "files";

const openDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);

        request.onupgradeneeded = () => {
            const db = request.result;

            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, {
                    keyPath: "id",
                });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

async function getFiles() {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(
            STORE_NAME,
            "readonly"
        );

        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function saveFile(file) {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(
            STORE_NAME,
            "readwrite"
        );

        transaction.objectStore(STORE_NAME).put(file);

        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
}

async function removeFile(id) {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(
            STORE_NAME,
            "readwrite"
        );

        transaction.objectStore(STORE_NAME).delete(id);

        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
}

export default function FileManager() {
    const [items, setItems] = useState([]);
    const [search, setSearch] = useState("");
    const [currentFolder, setCurrentFolder] = useState(null);

    useEffect(() => {
        loadItems();
    }, []);

    async function loadItems() {
        try {
            const data = await getFiles();
            setItems(data);
        } catch (error) {
            console.error("Failed to load files:", error);
        }
    }

    async function createFolder() {
        const folderName = prompt("Enter folder name:");

        if (!folderName?.trim()) return;

        const folder = {
            id: uuidv4(),
            name: folderName.trim(),
            type: "folder",
            parentId: currentFolder,
            createdAt: Date.now(),
        };

        await saveFile(folder);

        setItems((prev) => [...prev, folder]);
    }

    function uploadFile() {
        const input = document.createElement("input");

        input.type = "file";
        input.multiple = true;

        input.onchange = async (event) => {
            const files = Array.from(event.target.files || []);

            for (const file of files) {
                const newFile = {
                    id: uuidv4(),
                    name: file.name,
                    type: "file",
                    parentId: currentFolder,
                    size: file.size,
                    mimeType: file.type,
                    createdAt: Date.now(),
                    data: file,
                };

                await saveFile(newFile);
            }

            await loadItems();
        };

        input.click();
    }

    async function deleteItem(id) {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this?"
        );

        if (!confirmDelete) return;

        try {
            await removeFile(id);

            setItems((prev) =>
                prev.filter((item) => item.id !== id)
            );
        } catch (error) {
            console.error("Failed to delete item:", error);
        }
    }

    function openFolder(folder) {
        setCurrentFolder(folder.id);
        setSearch("");
    }

    function goHome() {
        setCurrentFolder(null);
        setSearch("");
    }

    const visibleItems = items.filter((item) => {
        const belongsToFolder =
            item.parentId === currentFolder;

        const matchesSearch =
            item.name
                .toLowerCase()
                .includes(search.toLowerCase());

        return belongsToFolder && matchesSearch;
    });

    function downloadFile(item) {
        if (!item.data) return;

        const url = URL.createObjectURL(item.data);

        const a = document.createElement("a");

        a.href = url;
        a.download = item.name;

        document.body.appendChild(a);
        a.click();
        a.remove();

        URL.revokeObjectURL(url);
    }

    return (
        <div className="p-2 bg-white w-full h-full">

            <div className="flex gap-3">
                <input
                    type="text"
                    value={search}
                    onChange={(e) =>
                        setSearch(e.target.value)
                    }
                    className="border border-black/50 outline-0 px-2 py-1 rounded-xl text-xs"
                    placeholder="Search Files/Folders.."
                />

                <button
                    className="rounded-2xl bg-blue-300 px-2 py-1"
                >
                    Search
                </button>

                <button
                    className="rounded-2xl bg-purple-300 px-2 py-1"
                    onClick={createFolder}
                >
                    New Folder
                </button>

                <button
                    className="rounded-2xl bg-pink-300 px-2 py-1"
                    onClick={uploadFile}
                >
                    Upload File
                </button>
            </div>


            <div className="flex gap-2 mt-5 text-xs">
                <button
                    onClick={goHome}
                    className="font-semibold hover:text-blue-500"
                >
                    Home
                </button>

                {currentFolder && (
                    <>
                        <span>/</span>

                        <span>
                            {
                                items.find(
                                    (item) =>
                                        item.id === currentFolder
                                )?.name
                            }
                        </span>
                    </>
                )}
            </div>


            <div className="mt-5 flex flex-wrap gap-5">
                {visibleItems.map((item) => (
                    <div
                        key={item.id}
                        className="w-24 relative group"
                    >

                        {item.type === "folder" && (
                            <div
                                onDoubleClick={() =>
                                    openFolder(item)
                                }
                                className="cursor-pointer"
                            >
                                <img
                                    src="/FileManager/folder.svg"
                                    alt="folder"
                                    className="w-16 h-16 mx-auto"
                                />

                                <p className="text-center text-xs truncate">
                                    {item.name}
                                </p>
                            </div>
                        )}


                        {item.type === "file" && (
                            <div
                                onDoubleClick={() =>
                                    downloadFile(item)
                                }
                                className="cursor-pointer"
                            >
                                <div className="w-16 h-16 mx-auto flex items-center justify-center text-4xl">
                                    📄
                                </div>

                                <p className="text-center text-xs truncate">
                                    {item.name}
                                </p>
                            </div>
                        )}


                        <button
                            onClick={() =>
                                deleteItem(item.id)
                            }
                            className="absolute -right-1 -top-1 hidden group-hover:block bg-red-500 text-white rounded-full w-5 h-5 text-xs"
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>

            {visibleItems.length === 0 && (
                <div className="mt-20 text-center text-gray-400 text-sm">
                    {search
                        ? "No files or folders found"
                        : "This folder is empty"}
                </div>
            )}
        </div>
    );
}
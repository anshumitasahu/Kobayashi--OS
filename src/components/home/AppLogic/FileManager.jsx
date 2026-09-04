import { useEffect, useMemo, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
    ClockIcon,
    DesktopIcon,
    FileTextIcon,
    DownloadSimpleIcon,
    ImageIcon,
    MusicNoteIcon,
    FolderIcon,
    MagnifyingGlassIcon,
    PlusIcon,
    UploadSimpleIcon,
    SquaresFourIcon,
    ListBulletsIcon,
    TrashIcon,
    XIcon,
    CaretLeftIcon,
    FileIcon,
} from "@phosphor-icons/react";
import { getPhotos, deletePhoto } from "../../../DB/IndexedDB";
import { MusicIndex } from "../../../lib/Music/MusicIndex";

const DB_NAME = "file-manager";
const STORE_NAME = "files";
const ACTIVE_BG = "rgba(241, 226, 255, 0.8)";

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
        const transaction = db.transaction(STORE_NAME, "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function saveFile(file) {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readwrite");
        transaction.objectStore(STORE_NAME).put(file);

        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
}

async function removeFile(id) {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readwrite");
        transaction.objectStore(STORE_NAME).delete(id);

        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
}

const FOLDERS = [
    { id: "recents", name: "Recents", icon: ClockIcon, color: "#60A5FA" },
    { id: "desktop", name: "Desktop", icon: DesktopIcon, color: "#34D399" },
    { id: "documents", name: "Documents", icon: FileTextIcon, color: "#FBBF24" },
    { id: "downloads", name: "Downloads", icon: DownloadSimpleIcon, color: "#A78BFA" },
    { id: "pictures", name: "Pictures", icon: ImageIcon, color: "#F472B6" },
    { id: "music", name: "Music", icon: MusicNoteIcon, color: "#FB923C" },
];

function readJSON(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return fallback;
        return JSON.parse(raw) ?? fallback;
    } catch {
        return fallback;
    }
}

function formatSize(bytes) {
    if (bytes === undefined || bytes === null) return "--";
    if (bytes === 0) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
    return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function formatDate(ts) {
    if (!ts) return "--";
    return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function noteTitle(text) {
    const first = (text || "").split("\n")[0].trim() || "Untitled note";
    return first.length > 28 ? first.slice(0, 28) + "..." : first;
}

export default function FileManager() {
    const [items, setItems] = useState([]);
    const [photos, setPhotos] = useState([]);
    const [notes, setNotes] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [activeFolder, setActiveFolder] = useState("recents");
    const [currentFolder, setCurrentFolder] = useState(null);
    const [search, setSearch] = useState("");
    const [view, setView] = useState("grid");
    const [selectedId, setSelectedId] = useState(null);
    const [preview, setPreview] = useState(null);
    const [showSidebar, setShowSidebar] = useState(true);
    const urlCache = useRef(new Map());

    useEffect(() => {
        loadAll();
        return () => {
            urlCache.current.forEach((url) => URL.revokeObjectURL(url));
            urlCache.current.clear();
        };
    }, []);

    async function loadAll() {
        try {
            const data = await getFiles();
            setItems(data);
        } catch (error) {
            console.error("Failed to load files:", error);
        }

        try {
            const galleryPhotos = await getPhotos();
            setPhotos(galleryPhotos);
        } catch (error) {
            console.error("Failed to load photos:", error);
        }

        const storedNotes = readJSON("notes", []);
        setNotes(Array.isArray(storedNotes) ? storedNotes.filter((n) => n && typeof n.text === "string") : []);
        setTasks(readJSON("mac-todo-tasks", []));
    }

    function blobUrl(key, blob) {
        if (!blob) return null;
        if (urlCache.current.has(key)) return urlCache.current.get(key);
        const url = URL.createObjectURL(blob);
        urlCache.current.set(key, url);
        return url;
    }

    const photoEntries = useMemo(
        () =>
            photos.map((p, i) => ({
                id: `photo-${p.id}`,
                rawId: p.id,
                name: `IMG_${String(i + 1).padStart(4, "0")}.jpg`,
                kind: "image",
                source: "gallery",
                blob: p.image,
                size: p.image?.size,
                date: p.date ? new Date(p.date).getTime() : Date.now(),
                deletable: true,
            })),
        [photos]
    );

    const noteEntries = useMemo(
        () =>
            notes.map((n) => ({
                id: `note-${n.id}`,
                name: `${noteTitle(n.text)}.txt`,
                kind: "note",
                source: "notes",
                text: n.text,
                color: n.color || "#fef08a",
                date: n.updatedAt || n.createdAt || Date.now(),
                deletable: false,
            })),
        [notes]
    );

    const musicEntries = useMemo(
        () =>
            MusicIndex.map((m) => ({
                id: `music-${m.id}`,
                name: `${m.name} - ${m.artist}.mp3`,
                kind: "audio",
                source: "music",
                src: m.Music,
                thumbnail: m.ThumbNail,
                date: null,
                deletable: false,
            })),
        []
    );

    const taskEntries = useMemo(
        () =>
            (Array.isArray(tasks) ? tasks : []).map((t) => ({
                id: `task-${t.id}`,
                name: `${t.text || "Untitled task"}.task`,
                kind: "task",
                source: "todos",
                text: t.text,
                complete: t.complete,
                date: t.createdAt || Date.now(),
                deletable: false,
            })),
        [tasks]
    );

    const userEntries = useMemo(
        () =>
            items.map((item) => ({
                ...item,
                kind: item.type === "folder" ? "folder" : fileKind(item),
                date: item.createdAt,
                deletable: item.type === "folder" ? true : true,
                source: "files",
            })),
        [items]
    );

    function fileKind(item) {
        if (item.mimeType?.startsWith("image/")) return "image";
        if (item.mimeType?.startsWith("audio/")) return "audio";
        if (item.mimeType?.startsWith("video/")) return "video";
        return "file";
    }

    const counts = useMemo(() => {
        const userFiles = userEntries.filter((e) => e.kind !== "folder");
        return {
            recents: [...photoEntries, ...noteEntries, ...taskEntries, ...userFiles].length,
            desktop: userEntries.filter((e) => e.parentId === null || e.parentId === undefined).length,
            documents: noteEntries.length,
            downloads: userFiles.length,
            pictures: photoEntries.length,
            music: musicEntries.length,
        };
    }, [photoEntries, noteEntries, taskEntries, musicEntries, userEntries]);

    const content = useMemo(() => {
        let out = [];
        if (activeFolder === "recents") {
            out = [
                ...userEntries.filter((e) => e.kind !== "folder"),
                ...photoEntries,
                ...noteEntries,
                ...taskEntries,
            ].sort((a, b) => (b.date || 0) - (a.date || 0));
        } else if (activeFolder === "desktop") {
            out = userEntries.filter((e) => (e.parentId ?? null) === currentFolder);
        } else if (activeFolder === "documents") {
            out = noteEntries;
        } else if (activeFolder === "downloads") {
            out = userEntries.filter((e) => e.kind !== "folder");
        } else if (activeFolder === "pictures") {
            out = photoEntries;
        } else if (activeFolder === "music") {
            out = musicEntries;
        }

        const q = search.trim().toLowerCase();
        if (q) out = out.filter((e) => e.name.toLowerCase().includes(q));
        return out;
    }, [activeFolder, currentFolder, search, userEntries, photoEntries, noteEntries, taskEntries, musicEntries]);

    const activeFolderMeta = FOLDERS.find((f) => f.id === activeFolder);
    const currentFolderMeta = items.find((i) => i.id === currentFolder);
    const canWrite = activeFolder === "desktop" || activeFolder === "downloads";

    function switchFolder(id) {
        setActiveFolder(id);
        setCurrentFolder(null);
        setSelectedId(null);
        setPreview(null);
    }

    function openEntry(entry) {
        if (entry.kind === "folder") {
            setActiveFolder("desktop");
            setCurrentFolder(entry.id);
            setSelectedId(null);
            return;
        }
        setPreview(entry);
    }

    function goUp() {
        if (currentFolder) {
            const parent = items.find((i) => i.id === currentFolder);
            setCurrentFolder(parent?.parentId ?? null);
            setSelectedId(null);
        }
    }

    async function createFolder() {
        const folderName = prompt("Enter folder name:");
        if (!folderName?.trim()) return;

        const folder = {
            id: uuidv4(),
            name: folderName.trim(),
            type: "folder",
            parentId: activeFolder === "desktop" ? currentFolder : null,
            createdAt: Date.now(),
        };

        await saveFile(folder);
        setItems((prev) => [...prev, folder]);
        if (activeFolder !== "desktop" && activeFolder !== "downloads") setActiveFolder("desktop");
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
                    parentId: activeFolder === "desktop" ? currentFolder : null,
                    size: file.size,
                    mimeType: file.type,
                    createdAt: Date.now(),
                    data: file,
                };
                await saveFile(newFile);
            }
            const data = await getFiles();
            setItems(data);
        };

        input.click();
    }

    async function deleteEntry(entry) {
        if (!entry.deletable) return;
        if (!window.confirm(`Delete "${entry.name}"?`)) return;

        try {
            if (entry.source === "gallery") {
                await deletePhoto(entry.rawId);
                setPhotos((prev) => prev.filter((p) => p.id !== entry.rawId));
            } else {
                await removeFile(entry.id);
                setItems((prev) => prev.filter((i) => i.id !== entry.id && i.parentId !== entry.id));
                if (currentFolder === entry.id) setCurrentFolder(null);
            }
            if (preview?.id === entry.id) setPreview(null);
            setSelectedId(null);
        } catch (error) {
            console.error("Failed to delete item:", error);
        }
    }

    function downloadEntry(entry) {
        if (entry.source === "gallery" && entry.blob) {
            const url = blobUrl(entry.id, entry.blob);
            triggerDownload(url, entry.name);
        } else if (entry.source === "notes" || entry.source === "todos") {
            const blob = new Blob([entry.text || ""], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            triggerDownload(url, entry.name);
            setTimeout(() => URL.revokeObjectURL(url), 5000);
        } else if (entry.source === "music") {
            const a = document.createElement("a");
            a.href = entry.src;
            a.download = entry.name;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } else if (entry.data) {
            const url = URL.createObjectURL(entry.data);
            triggerDownload(url, entry.name);
            setTimeout(() => URL.revokeObjectURL(url), 5000);
        }
    }

    function triggerDownload(url, name) {
        const a = document.createElement("a");
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        a.remove();
    }

    function previewUrl(entry) {
        if (entry.source === "gallery") return blobUrl(entry.id, entry.blob);
        if (entry.source === "files" && entry.data) return blobUrl(entry.id, entry.data);
        return null;
    }

    return (
        <div className={`grid h-full w-full gap-2 ${showSidebar ? "grid-cols-[1fr_3fr]" : "grid-cols-[1fr]"}`}>
            {showSidebar && (
                <aside className="w-full overflow-y-auto bg-white/50 p-1">
                    <div className="mb-1 mt-1 flex w-full items-center gap-3 rounded-md border border-black/10 bg-white px-2 py-1 text-xs">
                        <button>
                            <MagnifyingGlassIcon size={18} color="black" />
                        </button>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search here"
                            className="w-full min-w-0 outline-0 placeholder:text-neutral-400"
                        />
                        {search && (
                            <button onClick={() => setSearch("")} className="text-neutral-400 hover:text-neutral-600">
                                <XIcon size={12} weight="bold" />
                            </button>
                        )}
                    </div>

                    <div className="mb-1 mt-3 px-1 text-xs text-neutral-500">Favorites</div>
                    <div className="mt-1">
                        {FOLDERS.map((folder) => (
                            <button
                                key={folder.id}
                                onClick={() => switchFolder(folder.id)}
                                className="flex w-full items-center gap-3 rounded-md p-1 text-left"
                                style={{ backgroundColor: activeFolder === folder.id && !currentFolder ? ACTIVE_BG : "transparent" }}
                            >
                                <span className="rounded-md p-1" style={{ backgroundColor: folder.color }}>
                                    <folder.icon size={16} color="white" weight="duotone" />
                                </span>
                                <span className="flex-1 truncate text-xs text-neutral-600">{folder.name}</span>
                                <span className="text-xs tabular-nums text-neutral-400">{counts[folder.id] ?? 0}</span>
                            </button>
                        ))}
                    </div>
                </aside>
            )}

            <main className="relative flex h-full w-full flex-col overflow-hidden rounded bg-white">
                <div className="flex items-center gap-2 px-4 pt-4">
                    <button
                        onClick={() => setShowSidebar((v) => !v)}
                        title="Toggle sidebar"
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-neutral-500 hover:bg-black/5"
                    >
                        <span className="flex flex-col gap-[3px]">
                            <span className="block h-px w-3.5 bg-current" />
                            <span className="block h-px w-3.5 bg-current" />
                            <span className="block h-px w-3.5 bg-current" />
                        </span>
                    </button>
                    {currentFolder && (
                        <button
                            onClick={goUp}
                            title="Back"
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-neutral-500 hover:bg-black/5"
                        >
                            <CaretLeftIcon size={14} weight="bold" />
                        </button>
                    )}
                    <h2 className="mt-1 min-w-0 flex-1 truncate text-xs text-black">
                        {currentFolder ? currentFolderMeta?.name : activeFolderMeta?.name}
                    </h2>
                    <span className="shrink-0 text-xs text-neutral-400">{content.length} items</span>
                </div>

                <div className="flex items-center gap-2 px-4 py-3">
                    <div className="flex items-center rounded-md border border-black/10 bg-white p-0.5">
                        <button
                            onClick={() => setView("grid")}
                            title="Grid view"
                            className="rounded p-1"
                            style={{ backgroundColor: view === "grid" ? ACTIVE_BG : "transparent" }}
                        >
                            <SquaresFourIcon size={16} className="text-neutral-600" />
                        </button>
                        <button
                            onClick={() => setView("list")}
                            title="List view"
                            className="rounded p-1"
                            style={{ backgroundColor: view === "list" ? ACTIVE_BG : "transparent" }}
                        >
                            <ListBulletsIcon size={16} className="text-neutral-600" />
                        </button>
                    </div>
                    <span className="flex-1" />
                    <button
                        onClick={createFolder}
                        title="New folder"
                        className="flex shrink-0 items-center gap-1 rounded-md border border-black/10 bg-white px-2 py-1 text-xs text-neutral-600 hover:bg-black/5"
                    >
                        <PlusIcon size={14} weight="bold" /> Folder
                    </button>
                    <button
                        onClick={uploadFile}
                        title="Upload files"
                        className="flex shrink-0 items-center gap-1 rounded-md bg-primary px-2 py-1 text-xs text-white transition hover:opacity-90 active:scale-95"
                    >
                        <UploadSimpleIcon size={14} weight="bold" /> Upload
                    </button>
                </div>

                {!canWrite && !currentFolder && (
                    <p className="px-4 pb-2 text-[11px] text-neutral-400">
                        {activeFolder === "pictures" && "Synced live from Gallery"}
                        {activeFolder === "documents" && "Synced live from Notes"}
                        {activeFolder === "music" && "Built-in library"}
                        {activeFolder === "recents" && "Latest across Gallery, Notes, Reminders and your files"}
                        {activeFolder === "downloads" && "Every file you uploaded"}
                    </p>
                )}

                <div className="flex-1 overflow-y-auto px-4 pb-4">
                    {view === "grid" ? (
                        <div className="flex flex-wrap gap-4">
                            {content.map((entry) => (
                                <div
                                    key={entry.id}
                                    onClick={() => setSelectedId(entry.id)}
                                    onDoubleClick={() => openEntry(entry)}
                                    className="group relative w-24 cursor-pointer rounded-md p-1"
                                    style={{ backgroundColor: selectedId === entry.id ? ACTIVE_BG : "transparent" }}
                                >
                                    <GridThumb entry={entry} blobUrl={blobUrl} />
                                    <p className="mt-1 truncate text-center text-xs text-neutral-600">{entry.name}</p>
                                    {entry.deletable && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteEntry(entry);
                                            }}
                                            title="Delete"
                                            className="absolute -right-1 -top-1 hidden h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white group-hover:flex"
                                        >
                                            <TrashIcon size={11} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <ul className="flex flex-col gap-1">
                            {content.map((entry) => (
                                <li
                                    key={entry.id}
                                    onClick={() => setSelectedId(entry.id)}
                                    onDoubleClick={() => openEntry(entry)}
                                    className="group flex cursor-pointer items-center gap-3 rounded-md p-2 hover:bg-[#f2f2f2]"
                                    style={{ backgroundColor: selectedId === entry.id ? ACTIVE_BG : undefined }}
                                >
                                    <ListThumb entry={entry} blobUrl={blobUrl} />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-xs text-neutral-600">{entry.name}</p>
                                        <p className="mt-0.5 text-[10px] capitalize text-neutral-400">{entry.kind}</p>
                                    </div>
                                    <span className="hidden shrink-0 text-[11px] tabular-nums text-neutral-400 sm:block">
                                        {formatDate(entry.date)}
                                    </span>
                                    <span className="hidden w-16 shrink-0 text-right text-[11px] tabular-nums text-neutral-400 md:block">
                                        {formatSize(entry.size)}
                                    </span>
                                    {entry.deletable && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteEntry(entry);
                                            }}
                                            title="Delete"
                                            className="hidden shrink-0 rounded p-0.5 text-neutral-300 hover:text-red-500 group-hover:block"
                                        >
                                            <TrashIcon size={14} />
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}

                    {content.length === 0 && (
                        <p className="py-16 text-center text-xs text-neutral-400">
                            {search ? "No matches found." : "This folder is empty."}
                        </p>
                    )}
                </div>

                {preview && (
                    <div className="absolute inset-0 z-20 flex flex-col bg-black/60 p-4 backdrop-blur-sm">
                        <div className="mb-2 flex items-center gap-2">
                            <p className="min-w-0 flex-1 truncate text-xs font-medium text-white">{preview.name}</p>
                            <button
                                onClick={() => downloadEntry(preview)}
                                title="Download"
                                className="rounded-md bg-white/15 px-2 py-1 text-xs text-white hover:bg-white/25"
                            >
                                <DownloadSimpleIcon size={14} />
                            </button>
                            <button
                                onClick={() => setPreview(null)}
                                title="Close"
                                className="rounded-md bg-white/15 p-1 text-white hover:bg-white/25"
                            >
                                <XIcon size={14} weight="bold" />
                            </button>
                        </div>
                        <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto rounded-lg bg-white p-4">
                            <PreviewBody entry={preview} previewUrl={previewUrl} />
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

function GridThumb({ entry, blobUrl }) {
    if (entry.kind === "folder") {
        return <img src="/FileManager/folder.svg" alt="folder" className="mx-auto h-16 w-16" />;
    }
    if (entry.kind === "image") {
        const url = entry.source === "gallery" ? blobUrl(entry.id, entry.blob) : blobUrl(entry.id, entry.data);
        if (url) {
            return <img src={url} alt={entry.name} className="mx-auto h-16 w-16 rounded-md object-cover" />;
        }
        return (
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-md bg-[#F472B6]/15">
                <ImageIcon size={28} className="text-[#F472B6]" weight="duotone" />
            </div>
        );
    }
    if (entry.kind === "note") {
        return (
            <div
                className="mx-auto flex h-16 w-16 items-start overflow-hidden rounded-md border border-black/10 p-1.5"
                style={{ backgroundColor: entry.color }}
            >
                <p className="line-clamp-4 text-[8px] leading-tight text-neutral-700">{entry.text}</p>
            </div>
        );
    }
    if (entry.kind === "audio") {
        if (entry.thumbnail) {
            return <img src={entry.thumbnail} alt={entry.name} className="mx-auto h-16 w-16 rounded-md object-cover" />;
        }
        return (
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-md bg-[#FB923C]/15">
                <MusicNoteIcon size={28} className="text-[#FB923C]" weight="duotone" />
            </div>
        );
    }
    if (entry.kind === "task") {
        return (
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-md bg-[#A78BFA]/15">
                <FileTextIcon size={28} className="text-[#A78BFA]" weight="duotone" />
            </div>
        );
    }
    return (
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-md bg-neutral-100">
            <FileIcon size={28} className="text-neutral-400" weight="duotone" />
        </div>
    );
}

function ListThumb({ entry, blobUrl }) {
    if (entry.kind === "folder") {
        return <img src="/FileManager/folder.svg" alt="folder" className="h-8 w-8 shrink-0" />;
    }
    if (entry.kind === "image") {
        const url = entry.source === "gallery" ? blobUrl(entry.id, entry.blob) : blobUrl(entry.id, entry.data);
        if (url) return <img src={url} alt={entry.name} className="h-8 w-8 shrink-0 rounded object-cover" />;
    }
    if (entry.kind === "note") {
        return (
            <span className="h-8 w-8 shrink-0 rounded border border-black/10 p-1" style={{ backgroundColor: entry.color }}>
                <FileTextIcon size={20} className="text-neutral-600" />
            </span>
        );
    }
    if (entry.kind === "audio" && entry.thumbnail) {
        return <img src={entry.thumbnail} alt={entry.name} className="h-8 w-8 shrink-0 rounded object-cover" />;
    }
    const color = entry.kind === "audio" ? "#FB923C" : entry.kind === "task" ? "#A78BFA" : "#9CA3AF";
    const Icon = entry.kind === "audio" ? MusicNoteIcon : entry.kind === "task" ? FileTextIcon : FileIcon;
    return (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded" style={{ backgroundColor: `${color}22` }}>
            <Icon size={18} style={{ color }} weight="duotone" />
        </span>
    );
}

function PreviewBody({ entry, previewUrl }) {
    if (entry.kind === "image") {
        const url = previewUrl(entry);
        if (url) return <img src={url} alt={entry.name} className="max-h-full max-w-full rounded-lg object-contain" />;
        return <p className="text-xs text-neutral-400">Image unavailable.</p>;
    }
    if (entry.kind === "note" || entry.kind === "task") {
        return (
            <div
                className="max-h-full w-full max-w-md overflow-y-auto rounded-md border border-black/10 p-4"
                style={{ backgroundColor: entry.color || "#fff" }}
            >
                <p className="whitespace-pre-wrap text-xs leading-relaxed text-neutral-800">{entry.text}</p>
            </div>
        );
    }
    if (entry.kind === "audio") {
        return (
            <div className="flex w-full max-w-md flex-col items-center gap-3">
                {entry.thumbnail && <img src={entry.thumbnail} alt={entry.name} className="h-40 w-40 rounded-xl object-cover" />}
                <p className="text-center text-xs font-medium text-neutral-700">{entry.name}</p>
                <audio src={entry.src} controls className="w-full" />
            </div>
        );
    }
    if (entry.kind === "video" && entry.data) {
        return <video src={previewUrl(entry)} controls className="max-h-full max-w-full rounded-lg" />;
    }
    return (
        <div className="flex flex-col items-center gap-3 text-center">
            <FolderIcon size={48} className="text-neutral-300" weight="duotone" />
            <p className="text-xs text-neutral-500">No preview available. Download to view this file.</p>
        </div>
    );
}

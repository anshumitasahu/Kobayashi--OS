import { useEffect, useRef, useState } from "react";
import { ImageIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { useAppStore } from "../../../../store";
import {
    saveWallpaper,
    getWallpapers,
    deleteWallpaper,
} from "../../../../DB/wallpaperDB";

const BUILT_IN = [
    "bg2.png",
    "bg.png",
    "bg-6.jpg",
    "bg-n.png",
    "bg-1.png",
    "bg-new.jpeg",
];

export default function Wallpaper() {
    const setWallpaper = useAppStore((state) => state.setWallpaper);
    const wallpaper = useAppStore((state) => state.Wallpaper);
    const fileRef = useRef(null);

    const [tab, setTab] = useState("default");
    const [mine, setMine] = useState([]);
    const [previews, setPreviews] = useState({});
    const [busy, setBusy] = useState(false);

    const loadMine = async () => {
        try {
            const rows = await getWallpapers();
            const sorted = [...rows].sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );
            setMine(sorted);
            const urls = {};
            sorted.forEach((row) => {
                urls[row.id] = URL.createObjectURL(row.blob);
            });
            setPreviews((prev) => {
                Object.values(prev).forEach((url) => URL.revokeObjectURL(url));
                return urls;
            });
        } catch (err) {
            console.error("Failed to load wallpapers", err);
        }
    };

    useEffect(() => {
        loadMine();
        return () => {
            setPreviews((prev) => {
                Object.values(prev).forEach((url) => URL.revokeObjectURL(url));
                return {};
            });
        };
    }, []);

    const handleUpload = async (event) => {
        const files = Array.from(event.target.files || []);
        if (!files.length) return;
        setBusy(true);
        try {
            for (const file of files) {
                const isVideo = file.type.startsWith("video/");
                const isImage = file.type.startsWith("image/");
                if (!isVideo && !isImage) continue;
                await saveWallpaper({
                    blob: file,
                    name: file.name,
                    mime: file.type,
                    kind: isVideo ? "video" : "image",
                });
            }
            await loadMine();
        } catch (err) {
            console.error("Failed to save wallpaper", err);
        } finally {
            setBusy(false);
            event.target.value = "";
        }
    };

    const handleDelete = async (id) => {
        const current = useAppStore.getState().Wallpaper;
        await deleteWallpaper(id);
        if (current === `idb://${id}`) {
            setWallpaper("bg2.png");
        }
        await loadMine();
    };

    return (
        <div className="overflow-scroll h-full p-4 bg-white rounded-md">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs text-black">Wallpaper</h2>
                <div className="flex gap-1 p-1 bg-neutral-100 rounded-md">
                    {[
                        { id: "default", label: "Default" },
                        { id: "mine", label: "My Wallpapers" },
                    ].map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={`px-3 py-1 text-xs rounded transition-colors cursor-pointer ${
                                tab === t.id
                                    ? "bg-white shadow text-black"
                                    : "text-neutral-500 hover:text-black"
                            }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {tab === "default" && (
                <div className="grid grid-cols-2 gap-4">
                    {BUILT_IN.map((item) => (
                        <div
                            className={`aspect-video group overflow-hidden rounded ring-2 ring-offset-1 transition ${
                                wallpaper === item ? "ring-blue-500" : "ring-transparent"
                            }`}
                            key={item}
                            onClick={() => setWallpaper(item)}
                        >
                            <img
                                src={item}
                                className="rounded group-hover:scale-110 transition object-cover hover:cursor-pointer w-full h-full"
                            />
                        </div>
                    ))}
                </div>
            )}

            {tab === "mine" && (
                <div>
                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        hidden
                        onChange={handleUpload}
                    />
                    <button
                        onClick={() => fileRef.current?.click()}
                        disabled={busy}
                        className="w-full mb-4 flex items-center justify-center gap-2 px-3 py-2.5 text-xs rounded-md border border-dashed border-neutral-300 text-neutral-600 hover:border-neutral-500 hover:text-black transition-colors cursor-pointer disabled:opacity-50"
                    >
                        <PlusIcon size={14} />
                        {busy ? "Uploading..." : "Upload image or video"}
                    </button>

                    {mine.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-neutral-400">
                            <ImageIcon size={28} />
                            <p className="text-xs mt-2">No custom wallpapers yet</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            {mine.map((item) => {
                                const src = previews[item.id];
                                const selected = wallpaper === `idb://${item.id}`;
                                return (
                                    <div
                                        key={item.id}
                                        className={`relative aspect-video group overflow-hidden rounded ring-2 ring-offset-1 transition ${
                                            selected ? "ring-blue-500" : "ring-transparent"
                                        }`}
                                    >
                                        {item.kind === "video" ? (
                                            <video
                                                src={src}
                                                muted
                                                playsInline
                                                preload="metadata"
                                                onMouseEnter={(e) => e.target.play().catch(() => {})}
                                                onMouseLeave={(e) => {
                                                    e.target.pause();
                                                    e.target.currentTime = 0;
                                                }}
                                                onClick={() => setWallpaper(`idb://${item.id}`)}
                                                className="w-full h-full object-cover hover:cursor-pointer"
                                            />
                                        ) : (
                                            <img
                                                src={src}
                                                onClick={() => setWallpaper(`idb://${item.id}`)}
                                                className="group-hover:scale-110 transition object-cover hover:cursor-pointer w-full h-full"
                                            />
                                        )}
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            title="Delete"
                                            className="absolute top-1.5 right-1.5 p-1.5 rounded-md bg-black/50 text-white opacity-0 group-hover:opacity-100 hover:bg-black/70 transition cursor-pointer"
                                        >
                                            <TrashIcon size={12} />
                                        </button>
                                        <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded text-[10px] bg-black/50 text-white truncate max-w-[80%]">
                                            {item.name}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

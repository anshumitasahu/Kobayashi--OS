import { useEffect, useRef, useState } from "react";
import { ImageIcon, PlusIcon, TrashIcon, ArrowCounterClockwiseIcon, PlayIcon } from "@phosphor-icons/react";
import { useAppStore } from "../../../../store";
import {
    saveWallpaper,
    getWallpapers,
    deleteWallpaper,
} from "../../../../DB/wallpaperDB";
import {
    WALL_STILLS,
    WALL_LIVE,
    WALL_SOLIDS,
    COLOR_PREFIX,
    DEFAULT_WALLPAPER,
    isColorWallpaper,
    isCustomWallpaper,
    isVideoWallpaper,
} from "../../../../lib/wallpapers";

const TABS = [
    { id: "images", label: "Images" },
    { id: "live", label: "Live" },
    { id: "solid", label: "Solid" },
    { id: "mine", label: "My Wallpapers" },
];

export default function Wallpaper() {
    const setWallpaper = useAppStore((state) => state.setWallpaper);
    const wallpaper = useAppStore((state) => state.Wallpaper);
    const blur = useAppStore((state) => state.WallpaperBlur);
    const dim = useAppStore((state) => state.WallpaperDim);
    const setBlur = useAppStore((state) => state.setWallpaperBlur);
    const setDim = useAppStore((state) => state.setWallpaperDim);
    const fileRef = useRef(null);

    const [tab, setTab] = useState("images");
    const [mine, setMine] = useState([]);
    const [previews, setPreviews] = useState({});
    const [busy, setBusy] = useState(false);
    const [customColor, setCustomColor] = useState("#0a84ff");

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
            setWallpaper(DEFAULT_WALLPAPER);
        }
        await loadMine();
    };

    const ring = (active) => (active ? "ring-blue-500" : "ring-transparent");
    const isVideo = isCustomWallpaper(wallpaper)
        ? (mine.find((m) => `idb://${m.id}` === wallpaper)?.kind === "video")
        : isVideoWallpaper(wallpaper);
    const isSolid = isColorWallpaper(wallpaper);
    const solidHex = isSolid ? wallpaper.slice(COLOR_PREFIX.length) : null;

    return (
        <div className="overflow-scroll h-full p-4 bg-white rounded-md">
            <div className="relative aspect-[21/9] overflow-hidden rounded-lg bg-neutral-900 mb-4 ring-1 ring-black/10">
                {isSolid ? (
                    <div className="absolute inset-0" style={{ backgroundColor: solidHex }} />
                ) : wallpaper.startsWith("idb://") ? (
                    previews[wallpaper.slice(6)] &&
                    (isVideo ? (
                        <video src={previews[wallpaper.slice(6)]} autoPlay muted loop playsInline className="h-full w-full object-cover" style={{ filter: blur ? `blur(${blur}px)` : undefined, transform: blur ? "scale(1.08)" : undefined }} />
                    ) : (
                        <img src={previews[wallpaper.slice(6)]} className="h-full w-full object-cover" style={{ filter: blur ? `blur(${blur}px)` : undefined, transform: blur ? "scale(1.08)" : undefined }} />
                    ))
                ) : isVideo ? (
                    <video src={wallpaper} autoPlay muted loop playsInline className="h-full w-full object-cover" style={{ filter: blur ? `blur(${blur}px)` : undefined, transform: blur ? "scale(1.08)" : undefined }} />
                ) : (
                    <img src={wallpaper} className="h-full w-full object-cover" style={{ filter: blur ? `blur(${blur}px)` : undefined, transform: blur ? "scale(1.08)" : undefined }} />
                )}
                {dim > 0 && <div className="absolute inset-0 bg-black" style={{ opacity: dim / 100 }} />}
                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] bg-black/60 text-white truncate max-w-[80%]">
                    Preview
                </span>
            </div>

            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs text-black">Wallpaper</h2>
                <div className="flex gap-1 p-1 bg-neutral-100 rounded-md">
                    {TABS.map((t) => (
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

            {tab === "images" && (
                <div className="grid grid-cols-2 gap-4">
                    {WALL_STILLS.map((item) => (
                        <div
                            className={`aspect-video group overflow-hidden rounded ring-2 ring-offset-1 transition ${ring(wallpaper === item)}`}
                            key={item}
                            onClick={() => setWallpaper(item)}
                        >
                            <img
                                src={item}
                                loading="lazy"
                                className="rounded group-hover:scale-110 transition object-cover hover:cursor-pointer w-full h-full"
                            />
                        </div>
                    ))}
                </div>
            )}

            {tab === "live" && (
                <div className="grid grid-cols-2 gap-4">
                    {WALL_LIVE.map((item) => (
                        <div
                            className={`relative aspect-video group overflow-hidden rounded ring-2 ring-offset-1 transition ${ring(wallpaper === item)}`}
                            key={item}
                            onClick={() => setWallpaper(item)}
                        >
                            <video
                                src={item}
                                muted
                                playsInline
                                loop
                                preload="metadata"
                                onMouseEnter={(e) => e.target.play().catch(() => {})}
                                onMouseLeave={(e) => {
                                    e.target.pause();
                                    e.target.currentTime = 0;
                                }}
                                className="w-full h-full object-cover hover:cursor-pointer"
                            />
                            <span className="absolute top-1.5 left-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-black/60 text-white">
                                <PlayIcon size={10} weight="fill" /> Live
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {tab === "solid" && (
                <div>
                    <div className="grid grid-cols-7 gap-2">
                        {WALL_SOLIDS.map((hex) => (
                            <button
                                key={hex}
                                title={hex}
                                onClick={() => setWallpaper(`${COLOR_PREFIX}${hex}`)}
                                className={`aspect-square rounded-md ring-2 ring-offset-1 transition cursor-pointer ${ring(wallpaper === `${COLOR_PREFIX}${hex}`)}`}
                                style={{ backgroundColor: hex }}
                            />
                        ))}
                    </div>
                    <div className="mt-4 flex items-center gap-3 rounded-md border border-neutral-200 p-3">
                        <input
                            type="color"
                            value={isSolid ? solidHex : customColor}
                            onChange={(e) => setCustomColor(e.target.value)}
                            className="h-9 w-12 cursor-pointer rounded border border-neutral-300 bg-white p-1"
                        />
                        <div className="flex-1">
                            <p className="text-xs text-black">Custom color</p>
                            <p className="text-[10px] text-neutral-500">{isSolid ? solidHex : customColor}</p>
                        </div>
                        <button
                            onClick={() => setWallpaper(`${COLOR_PREFIX}${customColor}`)}
                            className="px-3 py-1.5 text-xs rounded-md bg-neutral-900 text-white hover:bg-neutral-700 transition-colors cursor-pointer"
                        >
                            Apply
                        </button>
                    </div>
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
                                        className={`relative aspect-video group overflow-hidden rounded ring-2 ring-offset-1 transition ${ring(selected)}`}
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

            <div className="mt-5 rounded-md border border-neutral-200 p-3">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs text-black">Effects</h3>
                    {(blur > 0 || dim > 0) && (
                        <button
                            onClick={() => {
                                setBlur(0);
                                setDim(0);
                            }}
                            className="flex items-center gap-1 px-2 py-1 text-[11px] rounded-md text-neutral-500 hover:text-black hover:bg-neutral-100 transition-colors cursor-pointer"
                        >
                            <ArrowCounterClockwiseIcon size={12} /> Reset
                        </button>
                    )}
                </div>
                <label className="flex items-center gap-3 mb-3">
                    <span className="w-14 text-[11px] text-neutral-500">Blur</span>
                    <input
                        type="range"
                        min="0"
                        max="24"
                        value={blur}
                        onChange={(e) => setBlur(Number(e.target.value))}
                        className="flex-1"
                    />
                    <span className="w-10 text-right text-[11px] text-neutral-600">{blur}px</span>
                </label>
                <label className="flex items-center gap-3">
                    <span className="w-14 text-[11px] text-neutral-500">Dim</span>
                    <input
                        type="range"
                        min="0"
                        max="80"
                        value={dim}
                        onChange={(e) => setDim(Number(e.target.value))}
                        className="flex-1"
                    />
                    <span className="w-10 text-right text-[11px] text-neutral-600">{dim}%</span>
                </label>
            </div>
        </div>
    );
}

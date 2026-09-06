import { useEffect, useMemo, useState } from "react";
import {
    ImageIcon,
    CaretLeftIcon,
    CaretRightIcon,
    XIcon,
    CheckIcon,
    ShuffleIcon,
    CameraIcon,
    SparkleIcon,
} from "@phosphor-icons/react";
import { getPhotos } from "../../../DB/IndexedDB";
import { loadWidgetSettings, saveWidgetSetting } from "../../../lib/Widgets/widgetSettings";

const DEFAULT_PHOTOS = [
    { id: "default-4", src: "/gallery/4.jpeg" },
    { id: "default-5", src: "/gallery/5.jpeg" },
    { id: "default-6", src: "/gallery/6.jpeg" },
    { id: "default-7", src: "/gallery/7.jpeg" },
    { id: "default-8", src: "/gallery/8.jpeg" },
    { id: "default-9", src: "/gallery/9.jpeg" },
    { id: "default-10", src: "/gallery/10.jpeg" },
    { id: "default-11", src: "/gallery/11.jpeg" },
];

const FILTERS = [
    { id: "all", label: "All" },
    { id: "featured", label: "Featured" },
    { id: "camera", label: "Camera" },
];

export default function PhotoFrame() {
    const [dbPhotos, setDbPhotos] = useState([]);
    const [dbUrls, setDbUrls] = useState({});
    const [photoId, setPhotoId] = useState(() => loadWidgetSettings()["photo-frame"] ?? null);
    const [picking, setPicking] = useState(false);
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        let alive = true;
        let currentUrls = [];
        const load = async () => {
            try {
                const list = await getPhotos();
                if (!alive) return;
                currentUrls.forEach((u) => URL.revokeObjectURL(u));
                currentUrls = list.map((p) => URL.createObjectURL(p.image));
                const map = {};
                list.forEach((p, i) => { map[p.id] = currentUrls[i]; });
                setDbPhotos(list);
                setDbUrls(map);
            } catch { /* ignore */ }
        };
        load();
        window.addEventListener("gallery-photos-changed", load);
        return () => {
            alive = false;
            window.removeEventListener("gallery-photos-changed", load);
            currentUrls.forEach((u) => URL.revokeObjectURL(u));
        };
    }, []);

    const cameraPhotos = useMemo(
        () => dbPhotos.map((p) => ({ id: p.id, src: dbUrls[p.id], isCamera: true })).filter((p) => p.src),
        [dbPhotos, dbUrls]
    );

    const allPhotos = useMemo(() => [...DEFAULT_PHOTOS, ...cameraPhotos], [cameraPhotos]);

    const current = useMemo(() => {
        if (allPhotos.length === 0) return null;
        return allPhotos.find((p) => p.id === photoId) ?? allPhotos[0];
    }, [allPhotos, photoId]);

    const idx = current ? allPhotos.findIndex((p) => p.id === current.id) : -1;

    const choose = (id) => {
        setPhotoId(id);
        saveWidgetSetting("photo-frame", id);
        setPicking(false);
    };

    const step = (dir) => {
        if (allPhotos.length === 0) return;
        const base = idx === -1 ? 0 : idx;
        const next = allPhotos[(base + dir + allPhotos.length) % allPhotos.length];
        setPhotoId(next.id);
        saveWidgetSetting("photo-frame", next.id);
    };

    const shuffle = () => {
        if (allPhotos.length < 2) return;
        let next;
        do {
            next = allPhotos[Math.floor(Math.random() * allPhotos.length)];
        } while (next.id === current?.id);
        choose(next.id);
    };

    const openPicker = () => {
        setFilter("all");
        setPicking(true);
    };

    const stop = (e) => e.stopPropagation();

    const filtered = filter === "featured" ? DEFAULT_PHOTOS : filter === "camera" ? cameraPhotos : null;

    const renderThumb = (p) => {
        const selected = p.id === (photoId ?? current?.id);
        return (
            <button
                key={p.id}
                onMouseDown={stop}
                onClick={() => choose(p.id)}
                aria-label="Pick photo"
                className={`group/thumb relative aspect-square overflow-hidden rounded-[2cqw] border-2 transition-all duration-150 active:scale-95 ${selected ? "border-white shadow-[0_0_0_2px_rgba(255,255,255,0.25)]" : "border-white/10 hover:border-white/40"}`}
            >
                <img src={p.src} alt="" loading="lazy" draggable={false} className="h-full w-full object-cover" />
                {selected && (
                    <span className="absolute right-[1cqw] top-[1cqw] flex items-center justify-center rounded-full bg-white text-black w-[4.5cqw] h-[4.5cqw] min-w-[14px] min-h-[14px] max-w-[20px] max-h-[20px]">
                        <CheckIcon size={11} weight="bold" />
                    </span>
                )}
            </button>
        );
    };

    if (allPhotos.length === 0) {
        return (
            <div className="@container w-full h-full min-w-0 min-h-0 flex flex-col items-center justify-center gap-[2cqw] rounded-[22px] bg-neutral-900 p-[5cqw] text-center overflow-hidden select-none">
                <ImageIcon size={22} className="text-neutral-500 shrink-0" />
                <p className="font-semibold text-neutral-300 text-[clamp(9px,4cqw,13px)]">No photos yet</p>
                <p className="text-neutral-500 text-[clamp(8px,3.4cqw,12px)]">Take one with the Camera app</p>
            </div>
        );
    }

    return (
        <div className="@container relative w-full h-full min-w-0 min-h-0 rounded-[22px] overflow-hidden bg-neutral-900 shadow-[0_8px_24px_rgba(0,0,0,0.25)] group/frame select-none">
            {current && (
                <img
                    key={current.id}
                    src={current.src}
                    alt=""
                    draggable={false}
                    className="absolute inset-0 w-full h-full object-cover"
                />
            )}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[32%] bg-gradient-to-t from-black/55 to-transparent opacity-0 group-hover/frame:opacity-100 transition-opacity" />

            {allPhotos.length > 1 && (
                <span className="absolute left-[2.5cqw] top-[2.5cqw] rounded-full bg-black/45 backdrop-blur-md px-[2.5cqw] py-[1cqw] font-medium tabular-nums text-white/90 text-[clamp(8px,3.2cqw,11px)]">
                    {idx + 1} / {allPhotos.length}
                </span>
            )}

            {current?.isCamera && (
                <span className="absolute right-[2.5cqw] top-[2.5cqw] flex items-center gap-[1cqw] rounded-full bg-black/45 backdrop-blur-md px-[2.5cqw] py-[1cqw] font-medium text-white/90 text-[clamp(8px,3.2cqw,11px)]">
                    <CameraIcon size={11} />
                    <span className="hidden @min-[200px]:inline">Camera</span>
                </span>
            )}

            {!picking && allPhotos.length > 1 && (
                <>
                    <button
                        onMouseDown={stop}
                        onClick={() => step(-1)}
                        aria-label="Previous photo"
                        className="absolute left-[2cqw] top-1/2 -translate-y-1/2 rounded-full bg-black/40 hover:bg-black/65 backdrop-blur-md text-white transition-all active:scale-90 p-[1.8cqw] @min-[200px]:opacity-0 @min-[200px]:group-hover/frame:opacity-100"
                    >
                        <CaretLeftIcon size={14} weight="bold" />
                    </button>
                    <button
                        onMouseDown={stop}
                        onClick={() => step(1)}
                        aria-label="Next photo"
                        className="absolute right-[2cqw] top-1/2 -translate-y-1/2 rounded-full bg-black/40 hover:bg-black/65 backdrop-blur-md text-white transition-all active:scale-90 p-[1.8cqw] @min-[200px]:opacity-0 @min-[200px]:group-hover/frame:opacity-100"
                    >
                        <CaretRightIcon size={14} weight="bold" />
                    </button>
                </>
            )}

            {!picking && (
                <div className="absolute bottom-[2.5cqw] inset-x-0 flex items-center justify-center gap-[1.5cqw] px-[3cqw] @min-[200px]:opacity-0 @min-[200px]:group-hover/frame:opacity-100 transition-opacity">
                    <button
                        onMouseDown={stop}
                        onClick={openPicker}
                        className="rounded-full bg-black/45 hover:bg-black/65 backdrop-blur-md px-[3cqw] py-[1.4cqw] font-medium text-white whitespace-nowrap transition-colors text-[clamp(8px,3.4cqw,12px)]"
                    >
                        Change
                    </button>
                    {allPhotos.length > 1 && (
                        <button
                            onMouseDown={stop}
                            onClick={shuffle}
                            aria-label="Shuffle photo"
                            className="rounded-full bg-black/45 hover:bg-black/65 backdrop-blur-md text-white transition-colors p-[1.6cqw]"
                        >
                            <ShuffleIcon size={13} />
                        </button>
                    )}
                </div>
            )}

            {picking && (
                <div
                    onMouseDown={stop}
                    className="absolute inset-0 flex flex-col bg-neutral-950/92 backdrop-blur-md"
                >
                    <div className="flex items-center justify-between gap-[2cqw] px-[3cqw] pt-[3cqw] pb-[1.5cqw] shrink-0">
                        <p className="font-semibold text-white truncate text-[clamp(9px,3.8cqw,13px)]">
                            Choose photo
                            <span className="ml-[1.5cqw] font-normal text-white/50 tabular-nums">{allPhotos.length}</span>
                        </p>
                        <button
                            onMouseDown={stop}
                            onClick={() => setPicking(false)}
                            aria-label="Close picker"
                            className="shrink-0 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors p-[1.4cqw]"
                        >
                            <XIcon size={13} weight="bold" />
                        </button>
                    </div>

                    <div className="flex gap-[1.5cqw] px-[3cqw] pb-[2cqw] shrink-0 overflow-x-auto">
                        {FILTERS.map((f) => (
                            <button
                                key={f.id}
                                onMouseDown={stop}
                                onClick={() => setFilter(f.id)}
                                className={`shrink-0 rounded-full px-[3cqw] py-[1.3cqw] font-medium whitespace-nowrap transition-colors text-[clamp(8px,3.2cqw,11px)] ${filter === f.id ? "bg-white text-black" : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"}`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>

                    <div className="koba-thin-scroll flex-1 min-h-0 overflow-y-auto px-[3cqw] pb-[2cqw]">
                        {filtered ? (
                            filtered.length > 0 ? (
                                <div className="grid gap-[1.8cqw] [grid-template-columns:repeat(auto-fill,minmax(min(52px,30cqw),1fr))]">
                                    {filtered.map(renderThumb)}
                                </div>
                            ) : (
                                <div className="flex h-full min-h-[16cqw] flex-col items-center justify-center gap-[1.5cqw] text-center">
                                    <CameraIcon size={20} className="text-white/30" />
                                    <p className="text-white/60 text-[clamp(8px,3.4cqw,12px)]">No camera photos yet</p>
                                    <button
                                        onMouseDown={stop}
                                        onClick={() => setFilter("featured")}
                                        className="flex items-center gap-[1.5cqw] rounded-full bg-white/10 hover:bg-white/20 px-[3cqw] py-[1.5cqw] text-white transition-colors text-[clamp(8px,3.2cqw,11px)]"
                                    >
                                        <SparkleIcon size={12} />
                                        Browse featured
                                    </button>
                                </div>
                            )
                        ) : (
                            <div className="flex flex-col gap-[2.5cqw]">
                                <div>
                                    <p className="mb-[1.5cqw] flex items-center gap-[1.5cqw] px-[0.5cqw] font-semibold uppercase tracking-wider text-white/40 text-[clamp(7px,2.8cqw,10px)]">
                                        <SparkleIcon size={11} />
                                        Featured
                                    </p>
                                    <div className="grid gap-[1.8cqw] [grid-template-columns:repeat(auto-fill,minmax(min(52px,30cqw),1fr))]">
                                        {DEFAULT_PHOTOS.map(renderThumb)}
                                    </div>
                                </div>
                                {cameraPhotos.length > 0 && (
                                    <div>
                                        <p className="mb-[1.5cqw] flex items-center gap-[1.5cqw] px-[0.5cqw] font-semibold uppercase tracking-wider text-white/40 text-[clamp(7px,2.8cqw,10px)]">
                                            <CameraIcon size={11} />
                                            Camera · {cameraPhotos.length}
                                        </p>
                                        <div className="grid gap-[1.8cqw] [grid-template-columns:repeat(auto-fill,minmax(min(52px,30cqw),1fr))]">
                                            {cameraPhotos.map(renderThumb)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

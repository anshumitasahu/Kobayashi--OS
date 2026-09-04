import { useEffect, useState } from "react";
import { ImageIcon, CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { getPhotos } from "../../../DB/IndexedDB";
import { loadWidgetSettings, saveWidgetSetting } from "../../../lib/Widgets/widgetSettings";

export default function PhotoFrame() {
    const [photos, setPhotos] = useState([]);
    const [photoId, setPhotoId] = useState(() => loadWidgetSettings()["photo-frame"] ?? null);
    const [picking, setPicking] = useState(false);
    const [urls, setUrls] = useState({});

    useEffect(() => {
        let alive = true;
        getPhotos().then((list) => {
            if (!alive) return;
            setPhotos(list);
            const map = {};
            list.forEach((p) => { map[p.id] = URL.createObjectURL(p.image); });
            setUrls(map);
        }).catch(() => {});
        return () => { alive = false; };
    }, []);

    useEffect(() => () => Object.values(urls).forEach((u) => URL.revokeObjectURL(u)), [urls]);

    const current = photos.find((p) => p.id === photoId) ?? null;
    const idx = current ? photos.findIndex((p) => p.id === current.id) : -1;

    const choose = (id) => {
        setPhotoId(id);
        saveWidgetSetting("photo-frame", id);
        setPicking(false);
    };

    const step = (dir) => {
        if (photos.length === 0) return;
        const next = photos[(idx + dir + photos.length) % photos.length];
        choose(next.id);
    };

    if (photos.length === 0) {
        return (
            <div className="@container w-full h-full min-w-0 min-h-0 flex flex-col items-center justify-center gap-[1.5cqw] rounded-xl bg-neutral-900 p-[4cqw] text-center overflow-hidden">
                <ImageIcon size={22} className="text-neutral-500 shrink-0" />
                <p className="font-semibold text-neutral-300 text-[clamp(9px,4cqw,13px)]">No photos yet</p>
                <p className="text-neutral-500 text-[clamp(8px,3.4cqw,12px)]">Take one with the Camera app</p>
            </div>
        );
    }

    return (
        <div className="@container relative w-full h-full min-w-0 min-h-0 rounded-xl overflow-hidden bg-neutral-900 group/frame">
            {current ? (
                <img src={urls[current.id]} alt="" className="w-full h-full object-cover" />
            ) : (
                <button
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={() => setPicking(true)}
                    className="w-full h-full min-h-0 flex flex-col items-center justify-center gap-[1.5cqw] text-neutral-300 hover:text-white p-[3cqw]"
                >
                    <ImageIcon size={22} className="shrink-0" />
                    <span className="font-medium text-[clamp(9px,3.8cqw,13px)]">Choose a photo</span>
                </button>
            )}

            {current && !picking && (
                <>
                    {photos.length > 1 && (
                        <>
                            <button onMouseDown={(e) => e.stopPropagation()} onClick={() => step(-1)} className="absolute left-1.5 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1 text-white opacity-0 group-hover/frame:opacity-100 transition-opacity">
                                <CaretLeftIcon size={16} />
                            </button>
                            <button onMouseDown={(e) => e.stopPropagation()} onClick={() => step(1)} className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1 text-white opacity-0 group-hover/frame:opacity-100 transition-opacity">
                                <CaretRightIcon size={16} />
                            </button>
                        </>
                    )}
                    <button
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={() => setPicking(true)}
                        className="absolute bottom-1.5 left-1/2 -translate-x-1/2 rounded-full bg-black/40 px-2.5 py-1 font-medium text-white opacity-0 group-hover/frame:opacity-100 transition-opacity whitespace-nowrap text-[clamp(8px,3.4cqw,12px)]"
                    >
                        Change
                    </button>
                </>
            )}

            {picking && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm p-[2.5cqw] overflow-y-auto">
                    <p className="font-semibold text-white mb-1.5 px-0.5 text-[clamp(8px,3.4cqw,12px)]">Choose a photo</p>
                    <div className="grid gap-[1.5cqw] [grid-template-columns:repeat(auto-fill,minmax(44px,1fr))]">
                        {photos.map((p) => (
                            <button
                                key={p.id}
                                onMouseDown={(e) => e.stopPropagation()}
                                onClick={() => choose(p.id)}
                                className={`rounded-md overflow-hidden border-2 ${p.id === photoId ? "border-white" : "border-transparent"}`}
                            >
                                <img src={urls[p.id]} alt="" className="aspect-square w-full object-cover" />
                            </button>
                        ))}
                    </div>
                    {current && (
                        <button
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={() => setPicking(false)}
                            className="mt-1.5 w-full rounded-md bg-white/15 py-1 text-white text-[clamp(8px,3.4cqw,12px)]"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

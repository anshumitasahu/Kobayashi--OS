import { useEffect, useState } from "react";
import Welcome from "./home/AppLogic/Welcome";
import { getWallpaper } from "../DB/wallpaperDB";
import {
    CUSTOM_PREFIX,
    COLOR_PREFIX,
    DEFAULT_WALLPAPER,
    normalizeWallpaper,
    isColorWallpaper,
    isCustomWallpaper as checkCustomWallpaper,
    isVideoWallpaper as checkVideoWallpaper,
} from "../lib/wallpapers";

export default function FirstRun({ onDone }) {
    const savedWallpaper = (() => {
        try {
            return normalizeWallpaper(localStorage.getItem("Wallpaper"), DEFAULT_WALLPAPER);
        } catch {
            return DEFAULT_WALLPAPER;
        }
    })();

    const [customSrc, setCustomSrc] = useState(null);
    const [customKind, setCustomKind] = useState(null);
    const [vp, setVp] = useState(() => ({
        w: typeof window !== "undefined" ? window.innerWidth : 1280,
        h: typeof window !== "undefined" ? window.innerHeight : 800,
    }));

    useEffect(() => {
        const onResize = () => setVp({ w: window.innerWidth, h: window.innerHeight });
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    const isCustom = checkCustomWallpaper(savedWallpaper);
    const isSolid = isColorWallpaper(savedWallpaper);

    useEffect(() => {
        if (!isCustom) return;
        let cancelled = false;
        let url = null;
        const id = (savedWallpaper || "").slice(CUSTOM_PREFIX.length);
        getWallpaper(id)
            .then((row) => {
                if (cancelled || !row?.blob) return;
                url = URL.createObjectURL(row.blob);
                setCustomSrc(url);
                setCustomKind(row.kind || (row.mime?.startsWith("video/") ? "video" : "image"));
            })
            .catch(() => {
                setCustomSrc(null);
                setCustomKind(null);
            });
        return () => {
            cancelled = true;
            if (url) URL.revokeObjectURL(url);
            setCustomSrc(null);
            setCustomKind(null);
        };
    }, [savedWallpaper, isCustom]);

    const resolvedSrc = isCustom ? customSrc : isSolid ? null : savedWallpaper;
    const isVideo = isSolid
        ? false
        : isCustom
            ? customKind === "video"
            : checkVideoWallpaper(savedWallpaper);

    const FRAME_PAD = 8;
    const TEXT_H = 152;
    const availW = Math.max(300, vp.w * 0.96 - FRAME_PAD * 2);
    const availH = Math.max(200, vp.h * 0.96 - TEXT_H - FRAME_PAD * 2);
    const frameW = Math.min(availW, (availH * 16) / 9);

    return (
        <div className="fixed inset-0 z-50 h-screen w-screen overflow-hidden">
            <div className="absolute inset-0 -z-10" style={isSolid ? { backgroundColor: savedWallpaper.slice(COLOR_PREFIX.length) } : undefined}>
                {isSolid ? null : isVideo ? (
                    resolvedSrc && (
                        <video
                            key={resolvedSrc}
                            src={resolvedSrc}
                            className="h-full w-full object-cover"
                            autoPlay
                            muted
                            loop
                            playsInline
                            disablePictureInPicture
                        />
                    )
                ) : (
                    resolvedSrc && <img src={resolvedSrc} alt="" className="h-full w-full object-cover" draggable={false} />
                )}
                <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
            </div>

            <div className="flex h-full w-full items-center justify-center">
                <div
                    className="overflow-hidden rounded-2xl bg-white/50 p-2 shadow-2xl ring-1 ring-white/60 backdrop-blur-2xl"
                    style={{ width: `${Math.round(frameW + FRAME_PAD * 2)}px` }}
                >
                    <div className="overflow-hidden rounded-xl">
                        <Welcome fit onDone={onDone} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export const VIDEO_RE = /\.(mp4|webm|mov|m4v|ogv|ogg)(\?.*)?$/i;
export const CUSTOM_PREFIX = "idb://";
export const COLOR_PREFIX = "color:";
export const DEFAULT_WALLPAPER = "/wall/bg2.png";

export const WALL_STILLS = [
    "/wall/bg2.png",
    "/wall/bg.png",
    "/wall/bg-6.jpg",
    "/wall/bg-n.png",
    "/wall/bg-10.png",
    "/wall/bg-11.jpg",
    "/wall/bg-12.jpg",
    "/wall/bg-13.jpg",
    "/wall/bg-14.jpg",
    "/wall/bg-15.jpg",
    "/wall/bg-16.jpg",
    "/wall/bg-17.jpg",
    "/wall/bg-18.jpg",
    "/wall/bg-19.jpg",
];

export const WALL_LIVE = ["/wall/live.webm"];

export const WALL_SOLIDS = [
    "#000000",
    "#1c1c1e",
    "#3a3a3c",
    "#636366",
    "#0a84ff",
    "#5e5ce6",
    "#bf5af2",
    "#ff375f",
    "#ff9f0a",
    "#ffd60a",
    "#30d158",
    "#64d2ff",
    "#ffffff",
    "#f5f5f7",
];

export const isColorWallpaper = (value) => (value || "").startsWith(COLOR_PREFIX);
export const isCustomWallpaper = (value) => (value || "").startsWith(CUSTOM_PREFIX);
export const isVideoWallpaper = (value) => VIDEO_RE.test(value || "");

const LEGACY_MAP = {
    "bg2.png": "/wall/bg2.png",
    "bg.png": "/wall/bg.png",
    "bg-6.jpg": "/wall/bg-6.jpg",
    "bg-n.png": "/wall/bg-n.png",
    "bg-1.png": "/wall/bg-11.jpg",
    "bg-new.jpeg": "/wall/bg-10.png",
    "wall/bg2.png": "/wall/bg2.png",
    "wall/bg.png": "/wall/bg.png",
    "wall/bg-6.jpg": "/wall/bg-6.jpg",
    "wall/bg-n.png": "/wall/bg-n.png",
    "wall/live.webm": "/wall/live.webm",
};

export function normalizeWallpaper(value, fallback = DEFAULT_WALLPAPER) {
    if (!value) return fallback;
    if (
        value.startsWith(CUSTOM_PREFIX) ||
        value.startsWith(COLOR_PREFIX) ||
        value.startsWith("http") ||
        value.startsWith("/") ||
        value.startsWith("wall/") ||
        value.startsWith("blob:")
    ) {
        return value;
    }
    if (LEGACY_MAP[value]) return LEGACY_MAP[value];
    return value;
}

import { useCallback, useEffect, useRef, useState } from "react";
import {
    ApertureIcon,
    CameraRotateIcon,
    CameraSlashIcon,
    CheckIcon,
    DownloadSimpleIcon,
    FlipHorizontalIcon,
    ImageIcon,
    LightningIcon,
    LightningSlashIcon,
    SquaresFourIcon,
    SparkleIcon,
    SunIcon,
    TimerIcon,
    TrashIcon,
    XIcon,
} from "@phosphor-icons/react";
import { useAppStore } from "../../../store";
import { savePhoto, getPhotos, deletePhoto } from "../../../DB/IndexedDB";
import { AppsInMenu } from "../../../lib/menuApps/menuAppIndex";

const FILTERS = [
    { name: "Normal", css: "none", swatch: "linear-gradient(135deg,#e2e8f0,#94a3b8)" },
    { name: "Vivid", css: "saturate(1.5) contrast(1.12)", swatch: "linear-gradient(135deg,#22d3ee,#e879f9)" },
    { name: "Mono", css: "grayscale(1) contrast(1.05)", swatch: "linear-gradient(135deg,#fafafa,#525252)" },
    { name: "Noir", css: "grayscale(1) contrast(1.35) brightness(0.92)", swatch: "linear-gradient(135deg,#27272a,#000000)" },
    { name: "Sepia", css: "sepia(0.85) contrast(1.02)", swatch: "linear-gradient(135deg,#fde68a,#92400e)" },
    { name: "Warm", css: "sepia(0.35) saturate(1.4) hue-rotate(-12deg) brightness(1.04)", swatch: "linear-gradient(135deg,#fdba74,#dc2626)" },
    { name: "Cool", css: "saturate(1.15) hue-rotate(18deg) brightness(1.06)", swatch: "linear-gradient(135deg,#7dd3fc,#1d4ed8)" },
    { name: "Fade", css: "contrast(0.85) brightness(1.12) saturate(0.65)", swatch: "linear-gradient(135deg,#f5f5f4,#a8a29e)" },
    { name: "Drama", css: "contrast(1.45) saturate(0.75) brightness(0.98)", swatch: "linear-gradient(135deg,#f43f5e,#18181b)" },
];

const TIMER_OPTIONS = [0, 3, 10];

export default function Camera({ autoCapture = false }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const captureRef = useRef(null);

    const [stream, setStream] = useState(null);
    const [dbReady, setDbReady] = useState(false);
    const [cameraError, setCameraError] = useState(null);

    const [capturedPhoto, setCapturedPhoto] = useState(null);
    const [capturedId, setCapturedId] = useState(null);
    const [lastPhoto, setLastPhoto] = useState(null);
    const [lastPhotoId, setLastPhotoId] = useState(null);

    const [filter, setFilter] = useState(FILTERS[0]);
    const [facingMode, setFacingMode] = useState("user");
    const [mirrored, setMirrored] = useState(true);
    const [flashOn, setFlashOn] = useState(false);
    const [flashFired, setFlashFired] = useState(false);
    const [gridOn, setGridOn] = useState(true);
    const [timerSec, setTimerSec] = useState(0);
    const [countdown, setCountdown] = useState(null);
    const [burstMode, setBurstMode] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false);
    const [showAdjust, setShowAdjust] = useState(false);
    const [brightness, setBrightness] = useState(1);
    const [contrast, setContrast] = useState(1);
    const [zoom, setZoom] = useState(1);
    const [photoCount, setPhotoCount] = useState(0);

    const openApp = useAppStore((state) => state.openApp);
    const setGallerySelectedPhotoId = useAppStore(
        (state) => state.setGallerySelectedPhotoId
    );

    const liveFilter =
        filter.css === "none"
            ? `brightness(${brightness}) contrast(${contrast})`
            : `${filter.css} brightness(${brightness}) contrast(${contrast})`;

    useEffect(() => {
        setDbReady(true);
    }, []);

    const loadLastPhoto = useCallback(async () => {
        try {
            const photos = await getPhotos();
            setPhotoCount(photos.length);
            if (photos.length === 0) {
                setLastPhoto(null);
                setLastPhotoId(null);
                return;
            }
            const last = photos[photos.length - 1];
            if (last?.image) {
                const url = URL.createObjectURL(last.image);
                setLastPhoto((prev) => {
                    if (prev) URL.revokeObjectURL(prev);
                    return url;
                });
                setLastPhotoId(last.id);
            }
        } catch (error) {
            console.error("Failed to load last photo:", error);
        }
    }, []);

    useEffect(() => {
        if (!dbReady) return;
        loadLastPhoto();
    }, [dbReady, loadLastPhoto]);

    const startCamera = useCallback(async () => {
        setCameraError(null);
        try {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((t) => t.stop());
            }
            const next = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode,
                },
                audio: false,
            });
            streamRef.current = next;
            if (videoRef.current) {
                videoRef.current.srcObject = next;
                await videoRef.current.play().catch(() => {});
            }
            setStream(next);
        } catch (error) {
            console.error("Camera error:", error);
            setCameraError(
                error?.name === "NotAllowedError"
                    ? "Camera access denied. Allow permission and retry."
                    : "No camera found. Connect a camera and retry."
            );
        }
    }, [facingMode]);

    useEffect(() => {
        startCamera();
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((t) => t.stop());
                streamRef.current = null;
            }
        };
    }, [startCamera]);

    const doCapture = useCallback(async () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas || !video.videoWidth) return null;
        const ctx = canvas.getContext("2d");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.filter = liveFilter === "brightness(1) contrast(1)" ? "none" : liveFilter;
        ctx.save();
        if (mirrored && facingMode === "user") {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
        }
        const zw = canvas.width / zoom;
        const zh = canvas.height / zoom;
        ctx.drawImage(
            video,
            (canvas.width - zw) / 2,
            (canvas.height - zh) / 2,
            zw,
            zh,
            0,
            0,
            canvas.width,
            canvas.height
        );
        ctx.restore();

        const blob = await new Promise((res) =>
            canvas.toBlob((b) => res(b), "image/jpeg", 0.92)
        );
        if (!blob) return null;
        const id = await savePhoto(blob);
        const url = URL.createObjectURL(blob);
        return { id, url };
    }, [liveFilter, mirrored, facingMode, zoom]);

    const fireFlash = () => {
        if (!flashOn) return;
        setFlashFired(true);
        setTimeout(() => setFlashFired(false), 280);
    };

    const capturePhoto = useCallback(async () => {
        if (isCapturing || !stream || !dbReady) return;
        setIsCapturing(true);

        const run = async () => {
            fireFlash();
            if (burstMode) {
                const shots = [];
                for (let i = 0; i < 3; i++) {
                    await new Promise((r) => setTimeout(r, 350));
                    const shot = await doCapture();
                    if (shot) shots.push(shot);
                }
                const last = shots[shots.length - 1];
                if (last) {
                    setCapturedPhoto(last.url);
                    setCapturedId(last.id);
                    setLastPhoto(last.url);
                    setLastPhotoId(last.id);
                }
            } else {
                const shot = await doCapture();
                if (shot) {
                    setCapturedPhoto(shot.url);
                    setCapturedId(shot.id);
                    setLastPhoto(shot.url);
                    setLastPhotoId(shot.id);
                }
            }
            loadLastPhoto();
            setIsCapturing(false);
        };

        if (timerSec > 0) {
            for (let s = timerSec; s > 0; s--) {
                setCountdown(s);
                await new Promise((r) => setTimeout(r, 1000));
            }
            setCountdown(null);
            run();
        } else {
            run();
        }
    }, [isCapturing, stream, dbReady, burstMode, timerSec, doCapture, loadLastPhoto]);

    captureRef.current = capturePhoto;

    useEffect(() => {
        if (!autoCapture || !stream || !dbReady) return;
        const t = setTimeout(() => captureRef.current?.(), 600);
        return () => clearTimeout(t);
    }, [autoCapture, stream, dbReady]);

    const discardCaptured = async (deleteSaved = false) => {
        if (deleteSaved && capturedId) {
            try {
                await deletePhoto(capturedId);
            } catch (e) {
                console.error("Delete failed:", e);
            }
            loadLastPhoto();
        }
        if (capturedPhoto) URL.revokeObjectURL(capturedPhoto);
        setCapturedPhoto(null);
        setCapturedId(null);
    };

    const downloadCaptured = () => {
        if (!capturedPhoto) return;
        const a = document.createElement("a");
        a.href = capturedPhoto;
        a.download = `kobayashi-cam-${Date.now()}.jpg`;
        a.click();
    };

    const openLastPhoto = () => {
        if (!lastPhotoId) return;
        const galleryApp = AppsInMenu().find((app) => app.name === "Gallery");
        if (!galleryApp) return;
        setGallerySelectedPhotoId(lastPhotoId);
        openApp(galleryApp);
    };

    const cycleTimer = () => {
        const i = TIMER_OPTIONS.indexOf(timerSec);
        setTimerSec(TIMER_OPTIONS[(i + 1) % TIMER_OPTIONS.length]);
    };

    const flipCamera = () => {
        setFacingMode((f) => (f === "user" ? "environment" : "user"));
        setMirrored((m) => (facingMode === "user" ? false : true));
    };

    return (
        <div className="w-full h-full flex flex-col bg-neutral-950 rounded-md overflow-hidden select-none text-white">
            {/* Top HUD */}
            <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-b from-black/80 to-transparent z-10">
                <div className="flex items-center gap-2">
                    <span className="text-[11px] tracking-[0.2em] text-neutral-300">
                        {burstMode ? "BURST" : "CAM"} · 720P
                    </span>
                    {photoCount > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/70">
                            {photoCount}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    <HudButton
                        active={flashOn}
                        onClick={() => setFlashOn((v) => !v)}
                        title="Flash"
                    >
                        {flashOn ? <LightningIcon size={16} weight="fill" /> : <LightningSlashIcon size={16} />}
                    </HudButton>
                    <HudButton
                        active={timerSec > 0}
                        onClick={cycleTimer}
                        title="Timer"
                        badge={timerSec > 0 ? `${timerSec}s` : null}
                    >
                        <TimerIcon size={16} />
                    </HudButton>
                    <HudButton active={gridOn} onClick={() => setGridOn((v) => !v)} title="Grid">
                        <SquaresFourIcon size={16} />
                    </HudButton>
                    <HudButton active={false} onClick={flipCamera} title="Flip camera">
                        <CameraRotateIcon size={16} />
                    </HudButton>
                </div>
            </div>

            {/* Viewfinder */}
            <div className="relative flex-1 min-h-0 mx-3 rounded-xl overflow-hidden bg-black ring-1 ring-white/10 shadow-2xl">
                {cameraError ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
                        <CameraSlashIcon size={40} className="text-white/30" />
                        <p className="text-sm text-white/70 max-w-55">{cameraError}</p>
                        <button
                            onClick={startCamera}
                            className="px-4 py-2 rounded-full bg-white text-black text-xs font-semibold hover:bg-neutral-200 transition cursor-pointer"
                        >
                            Retry camera
                        </button>
                    </div>
                ) : (
                    <>
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="absolute inset-0 w-full h-full object-cover"
                            style={{
                                filter: liveFilter,
                                transform: `scale(${zoom}) ${mirrored && facingMode === "user" ? "scaleX(-1)" : ""}`,
                            }}
                        />
                        {gridOn && (
                            <div className="absolute inset-0 pointer-events-none">
                                <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/25" />
                                <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/25" />
                                <div className="absolute top-1/3 left-0 right-0 h-px bg-white/25" />
                                <div className="absolute top-2/3 left-0 right-0 h-px bg-white/25" />
                            </div>
                        )}
                        <div className="absolute inset-3 pointer-events-none">
                            <Corner className="left-0 top-0 border-l-2 border-t-2 rounded-tl-md" />
                            <Corner className="right-0 top-0 border-r-2 border-t-2 rounded-tr-md" />
                            <Corner className="left-0 bottom-0 border-l-2 border-b-2 rounded-bl-md" />
                            <Corner className="right-0 bottom-0 border-r-2 border-b-2 rounded-br-md" />
                        </div>
                        <div className="absolute top-3 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full bg-black/55 backdrop-blur text-[10px] tracking-widest font-medium text-white/85 ring-1 ring-white/15">
                            {filter.name.toUpperCase()} · {Math.round(brightness * 100)}% · {zoom.toFixed(1)}X
                        </div>
                        {countdown !== null && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                <span key={countdown} className="text-7xl font-black text-white drop-shadow-lg scale-in">
                                    {countdown}
                                </span>
                            </div>
                        )}
                        {isCapturing && countdown === null && (
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/60 text-[11px] font-medium tracking-wide">
                                Capturing…
                            </div>
                        )}
                        <div
                            className={`absolute inset-0 bg-white pointer-events-none transition-opacity duration-300 ${
                                flashFired ? "opacity-90" : "opacity-0"
                            }`}
                        />
                    </>
                )}
                <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Adjust panel */}
            {showAdjust && (
                <div className="mx-3 mt-2 rounded-xl bg-white/8 ring-1 ring-white/10 backdrop-blur px-3 py-2.5 grid grid-cols-3 gap-3">
                    <Slider
                        icon={<SunIcon size={14} />}
                        label="Expo"
                        value={brightness}
                        min={0.4}
                        max={1.8}
                        step={0.01}
                        onChange={setBrightness}
                    />
                    <Slider
                        icon={<ApertureIcon size={14} />}
                        label="Contrast"
                        value={contrast}
                        min={0.4}
                        max={1.8}
                        step={0.01}
                        onChange={setContrast}
                    />
                    <Slider
                        icon={<SparkleIcon size={14} />}
                        label="Zoom"
                        value={zoom}
                        min={1}
                        max={3}
                        step={0.05}
                        onChange={setZoom}
                    />
                </div>
            )}

            {/* Filters */}
            <div className="flex justify-center px-3 pt-3 pb-1">
                <div className="flex items-start gap-2.5 overflow-x-auto scrollbar-none max-w-full p-1">
                {FILTERS.map((f) => {
                    const active = f.name === filter.name;
                    return (
                        <button
                            key={f.name}
                            onClick={() => setFilter(f)}
                            className={`flex flex-col items-center gap-1 shrink-0 cursor-pointer group ${
                                active ? "opacity-100" : "opacity-50 hover:opacity-85"
                            }`}
                        >
                            <span
                                className={`w-7 h-7 rounded-full ring-1 ring-offset-1 ring-offset-neutral-950 transition ${
                                    active ? "ring-amber-200 scale-105" : "ring-white/25 group-hover:ring-white/50"
                                }`}
                                style={{ background: f.swatch }}
                            />
                            <span
                                className={`text-[9px] font-medium tracking-wide leading-none ${
                                    active ? "text-amber-100" : "text-white/55"
                                }`}
                            >
                                {f.name}
                            </span>
                        </button>
                    );
                })}
                </div>
            </div>

            {/* Bottom controls */}
            <div className="flex items-center justify-between px-4 py-3">
                <button
                    onClick={openLastPhoto}
                    disabled={!lastPhoto}
                    className="w-12 h-12 rounded-xl overflow-hidden ring-2 ring-white/20 hover:ring-amber-300/70 transition disabled:opacity-30 cursor-pointer disabled:cursor-default bg-white/5 flex items-center justify-center"
                    title="Open last photo"
                >
                    {lastPhoto ? (
                        <img src={lastPhoto} alt="Last captured" className="w-full h-full object-cover" />
                    ) : (
                        <ImageIcon size={20} className="text-white/40" />
                    )}
                </button>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowAdjust((v) => !v)}
                        className={`p-2 rounded-full transition cursor-pointer ${
                            showAdjust ? "bg-amber-300 text-black" : "bg-white/10 text-white/80 hover:bg-white/20"
                        }`}
                        title="Manual controls"
                    >
                        <SunIcon size={16} />
                    </button>

                    <button
                        onClick={() => capturePhoto()}
                        disabled={!stream || !dbReady || isCapturing || !!cameraError}
                        className="group relative w-17 h-17 rounded-full p-1.5 bg-white/15 ring-2 ring-white/40 hover:ring-amber-300 transition disabled:opacity-40 cursor-pointer disabled:cursor-default"
                        title="Shutter"
                    >
                        <span
                            className={`block w-full h-full rounded-full transition-all ${
                                isCapturing
                                    ? "bg-red-500 scale-90"
                                    : "bg-white group-hover:scale-95 group-active:scale-90"
                            }`}
                        />
                        {timerSec > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-300 text-black text-[10px] font-bold flex items-center justify-center">
                                {timerSec}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={() => setMirrored((v) => !v)}
                        className={`p-2 rounded-full transition cursor-pointer ${
                            mirrored ? "bg-white/10 text-white/80 hover:bg-white/20" : "bg-white/5 text-white/40"
                        }`}
                        title="Mirror preview"
                    >
                        <FlipHorizontalIcon size={16} />
                    </button>
                </div>

                <div className="flex flex-col items-center gap-1 w-12">
                    <button
                        onClick={() => setBurstMode((v) => !v)}
                        className={`text-[10px] font-bold tracking-wider px-2 py-1 rounded-full transition cursor-pointer ${
                            burstMode ? "bg-amber-300 text-black" : "bg-white/10 text-white/70 hover:bg-white/20"
                        }`}
                        title="Burst x3"
                    >
                        {burstMode ? "X3" : "1X"}
                    </button>
                    <span className="text-[9px] text-white/40 font-medium tracking-widest">
                        {burstMode ? "BURST" : "PHOTO"}
                    </span>
                </div>
            </div>

            {/* Captured preview */}
            {capturedPhoto && (
                <div className="absolute inset-0 z-20 flex flex-col bg-black/90 backdrop-blur-sm rounded-md overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-2">
                        <span className="text-[11px] tracking-[0.2em] font-semibold text-white/80 flex items-center gap-2">
                            <CheckIcon size={14} className="text-emerald-300" /> SAVED TO GALLERY
                        </span>
                        <button
                            onClick={() => discardCaptured(false)}
                            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 cursor-pointer"
                        >
                            <XIcon size={16} />
                        </button>
                    </div>
                    <div className="flex-1 min-h-0 px-3">
                        <img
                            src={capturedPhoto}
                            alt="Captured"
                            className="w-full h-full object-contain rounded-xl ring-1 ring-white/15 bg-black"
                        />
                    </div>
                    <div className="flex items-center justify-center gap-2 px-4 py-3">
                        <PreviewAction
                            icon={<TrashIcon size={16} />}
                            label="Delete"
                            onClick={() => discardCaptured(true)}
                            danger
                        />
                        <PreviewAction
                            icon={<DownloadSimpleIcon size={16} />}
                            label="Save file"
                            onClick={downloadCaptured}
                        />
                        <PreviewAction
                            icon={<ImageIcon size={16} />}
                            label="Gallery"
                            onClick={() => {
                                discardCaptured(false);
                                openLastPhoto();
                            }}
                            primary
                        />
                    </div>
                </div>
            )}

            <style>{`
                .scrollbar-none::-webkit-scrollbar { display: none; }
                .scrollbar-none { scrollbar-width: none; }
                .scale-in { animation: pop 0.5s ease; }
                @keyframes pop {
                    0% { transform: scale(1.6); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
}

function HudButton({ children, onClick, active, title, badge }) {
    return (
        <button
            onClick={onClick}
            title={title}
            className={`relative p-2 rounded-full transition cursor-pointer ${
                active ? "bg-amber-300 text-black" : "bg-white/10 text-white/80 hover:bg-white/20"
            }`}
        >
            {children}
            {badge && (
                <span className="absolute -top-1 -right-1 text-[8px] font-bold bg-white text-black rounded-full px-1">
                    {badge}
                </span>
            )}
        </button>
    );
}

function Corner({ className }) {
    return <span className={`absolute w-6 h-6 border-white/60 ${className}`} />;
}

function Slider({ icon, label, value, min, max, step, onChange }) {
    return (
        <label className="flex flex-col gap-1">
            <span className="flex items-center gap-1 text-[10px] font-semibold tracking-wider text-white/60">
                {icon} {label.toUpperCase()} · {Number(value).toFixed(2)}
            </span>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full accent-amber-300 cursor-pointer"
            />
        </label>
    );
}

function PreviewAction({ icon, label, onClick, primary, danger }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition cursor-pointer ${
                primary
                    ? "bg-amber-300 text-black hover:bg-amber-200"
                    : danger
                      ? "bg-red-500/20 text-red-200 hover:bg-red-500/30 ring-1 ring-red-400/30"
                      : "bg-white/10 text-white hover:bg-white/20"
            }`}
        >
            {icon} {label}
        </button>
    );
}

import { useState, useEffect, useRef, useCallback } from "react";
import { useAppStore } from '../store.jsx';

const OPEN_MS = 280;
const CLOSE_MS = 180;
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const MIN_W = 260;
const MIN_H = 160;

const BODY_CURSOR = {
    n: "ns-resize",
    s: "ns-resize",
    e: "ew-resize",
    w: "ew-resize",
    ne: "nesw-resize",
    sw: "nesw-resize",
    nw: "nwse-resize",
    se: "nwse-resize",
};

const edgeHandles = [
    { dir: "n", className: "top-0 left-3 right-3 h-[7px] cursor-ns-resize" },
    { dir: "s", className: "bottom-0 left-3 right-3 h-[7px] cursor-ns-resize" },
    { dir: "e", className: "right-0 top-3 bottom-3 w-[7px] cursor-ew-resize" },
    { dir: "w", className: "left-0 top-3 bottom-3 w-[7px] cursor-ew-resize" },
];

const cornerHandles = [
    { dir: "nw", className: "top-0 left-0 w-4 h-4 cursor-nwse-resize" },
    { dir: "ne", className: "top-0 right-0 w-4 h-4 cursor-nesw-resize" },
    { dir: "sw", className: "bottom-0 left-0 w-4 h-4 cursor-nesw-resize" },
    { dir: "se", className: "bottom-0 right-0 w-4 h-4 cursor-nwse-resize" },
];

export default function Window({
    id,
    title,
    closeApp,
    children,
    desktopRef,
    zIndex,
    icon,
    windowState,
    x,
    y,
    width,
    height,
}) {
    const windowRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [offset, setOffset] = useState({ x: 0, y: 0, });
    const [mounted, setMounted] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [resizeDir, setResizeDir] = useState(null);
    const resizeStart = useRef(null);
    const closeTimer = useRef(null);
    const bringToFront = useAppStore((state) => state.bringToFront);
    const minimize = useAppStore((state) => state.minimize);
    const setWindowPosition = useAppStore((state) => state.setWindowPosition);
    const setWindowSize = useAppStore((state) => state.setWindowSize);
    const maximize = useAppStore((state) => state.maximize);
    const restore = useAppStore((state) => state.restore);

    const isMinimized = windowState === "minimized";
    const isMaximized = windowState === "maximized";

    const w = width ?? 500;
    const h = height ?? 400;
    const px = x ?? 250;
    const py = y ?? 100;

    useEffect(() => {
        const raf = requestAnimationFrame(() =>
            requestAnimationFrame(() => setMounted(true))
        );
        return () => cancelAnimationFrame(raf);
    }, []);

    useEffect(() => {
        return () => {
            if (closeTimer.current) clearTimeout(closeTimer.current);
        };
    }, []);

    const handleClose = useCallback(() => {
        if (isClosing) return;
        setIsClosing(true);
        closeTimer.current = setTimeout(closeApp, CLOSE_MS);
    }, [isClosing, closeApp]);

    const handleMouseDown = (e) => {
        if (isMaximized) {
            bringToFront(id);
            return;
        }
        setIsDragging(true);

        setOffset({
            x: e.clientX - px,
            y: e.clientY - py,
        });
        bringToFront(id)
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;

        const newX = e.clientX - offset.x;
        const newY = e.clientY - offset.y;

        const windowWidth = windowRef.current.offsetWidth;
        const windowHeight = windowRef.current.offsetHeight;

        const desktopWidth = desktopRef.current.clientWidth;
        const desktopHeight = desktopRef.current.clientHeight;

        setWindowPosition(
            id,
            Math.max(0, Math.min(newX, desktopWidth - windowWidth)),
            Math.max(0, Math.min(newY, desktopHeight - windowHeight)),
        );
    };

    useEffect(() => {
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isDragging, offset]);

    const handleResizeStart = useCallback((e, dir) => {
        if (e.button !== 0 || isMaximized) return;
        e.stopPropagation();
        e.preventDefault();
        bringToFront(id);
        setResizeDir(dir);
        resizeStart.current = {
            mouseX: e.clientX,
            mouseY: e.clientY,
            x: px,
            y: py,
            w,
            h,
        };
    }, [isMaximized, bringToFront, id, px, py, w, h]);

    useEffect(() => {
        if (!resizeDir) return;

        const handleResizeMove = (e) => {
            const start = resizeStart.current;
            if (!start) return;

            const dx = e.clientX - start.mouseX;
            const dy = e.clientY - start.mouseY;

            const desktopWidth = desktopRef?.current?.clientWidth ?? window.innerWidth;
            const desktopHeight = desktopRef?.current?.clientHeight ?? window.innerHeight;

            let newW = start.w;
            let newH = start.h;
            let newX = start.x;
            let newY = start.y;

            if (resizeDir.includes("e")) {
                newW = Math.min(Math.max(start.w + dx, MIN_W), desktopWidth - start.x);
            }
            if (resizeDir.includes("s")) {
                newH = Math.min(Math.max(start.h + dy, MIN_H), desktopHeight - start.y);
            }
            if (resizeDir.includes("w")) {
                const clampedX = Math.min(Math.max(start.x + dx, 0), start.x + start.w - MIN_W);
                newW = start.w + (start.x - clampedX);
                newX = clampedX;
            }
            if (resizeDir.includes("n")) {
                const clampedY = Math.min(Math.max(start.y + dy, 0), start.y + start.h - MIN_H);
                newH = start.h + (start.y - clampedY);
                newY = clampedY;
            }

            newW = Math.max(Math.round(newW), MIN_W);
            newH = Math.max(Math.round(newH), MIN_H);

            if (newX !== px || newY !== py) {
                setWindowPosition(id, Math.round(newX), Math.round(newY));
            }
            setWindowSize(id, newW, newH);
        };

        const handleResizeEnd = () => {
            setResizeDir(null);
            resizeStart.current = null;
        };

        window.addEventListener("mousemove", handleResizeMove);
        window.addEventListener("mouseup", handleResizeEnd);

        return () => {
            window.removeEventListener("mousemove", handleResizeMove);
            window.removeEventListener("mouseup", handleResizeEnd);
        };
    }, [resizeDir, desktopRef, id, px, py, setWindowPosition, setWindowSize]);

    useEffect(() => {
        if (!resizeDir) return;
        const cursor = BODY_CURSOR[resizeDir] ?? "default";
        const prevCursor = document.body.style.cursor;
        const prevSelect = document.body.style.userSelect;
        document.body.style.cursor = cursor;
        document.body.style.userSelect = "none";
        return () => {
            document.body.style.cursor = prevCursor;
            document.body.style.userSelect = prevSelect;
        };
    }, [resizeDir]);

    const vw = typeof window !== "undefined" ? window.innerWidth : 1280;
    const vh = typeof window !== "undefined" ? window.innerHeight : 800;
    const effW = isMaximized ? vw : w;
    const effH = isMaximized ? vh : h;
    const effX = isMaximized ? 0 : px;
    const effY = isMaximized ? 0 : py;
    const toDockX = vw / 2 - (effX + effW / 2);
    const toDockY = Math.max(120, vh - 60 - (effY + effH / 2));
    const dockTransform = `translate3d(${toDockX}px, ${toDockY}px, 0) scale(0.1)`;

    let transform = "translate3d(0, 0, 0) scale(1)";
    let opacity = 1;
    if (!mounted) {
        transform = dockTransform;
        opacity = 0;
    } else if (isClosing) {
        transform = "translate3d(0, 12px, 0) scale(0.96)";
        opacity = 0;
    } else if (isMinimized) {
        transform = dockTransform;
        opacity = 0;
    }

    const transformMs = isClosing ? CLOSE_MS : OPEN_MS;
    const isInteracting = isDragging || resizeDir;
    const transition = isInteracting
        ? "none"
        : `transform ${transformMs}ms ${EASE}, opacity ${CLOSE_MS}ms ease-out, ` +
        `width 220ms ${EASE}, height 220ms ${EASE}, left 220ms ${EASE}, top 220ms ${EASE}, ` +
        `visibility 0s linear ${isMinimized ? `${OPEN_MS}ms` : "0s"}`;

    return (
        <div
            ref={windowRef}
            onMouseDown={() => bringToFront(id)}
            className="flex flex-col flex-1 bg-white/50 backdrop-blur-2xl text-black p-2 rounded-lg shadow-xl overflow-hidden"
            style={{
                position: "absolute",
                zIndex: zIndex,
                userSelect: "none",
                width: isMaximized ? "100%" : `${w}px`,
                height: isMaximized ? "100%" : `${h}px`,
                left: isMaximized ? 0 : `${px}px`,
                top: isMaximized ? "0" : `${py}px`,
                transform,
                opacity,
                transformOrigin: "50% 100%",
                transition,
                visibility: isMinimized ? "hidden" : "visible",
                pointerEvents: isMinimized || isClosing ? "none" : "auto",
                willChange: "transform, opacity",
            }}
        >
            <div className="flex justify-between items-center cursor-move pb-2"
                onMouseDown={handleMouseDown}>
                <div className="flex gap-2 text-xs capitalize text-gray-500 items-center">
                    <img src={icon} className="w-5" />
                    {title}
                </div>
                <div className="flex gap-1 h-fit">
                    <button
                        onClick={() => {
                            if (windowState === "maximized") {
                                restore(id)
                            } else {
                                maximize(id)
                            }
                        }}
                        className="bg-green-400 text-white font-bold rounded-full p-2 cursor-pointer"
                    >
                    </button>
                    <button
                        onClick={() => minimize(id)}
                        className="bg-amber-400 text-white font-bold rounded-full p-2 cursor-pointer"
                    >
                    </button>
                    <button
                        onClick={handleClose}
                        className="bg-red-400 text-white font-bold rounded-full p-2 cursor-pointer"
                    >
                    </button>
                </div>
            </div>
            <div className="flex-1 overflow-hidden ">
                {children}
            </div>
            {!isMaximized && edgeHandles.map(({ dir, className }) => (
                <div
                    key={dir}
                    onMouseDown={(e) => handleResizeStart(e, dir)}
                    className={`absolute z-20 touch-none select-none ${className}`}
                />
            ))}
            {!isMaximized && cornerHandles.map(({ dir, className }) => (
                <div
                    key={dir}
                    onMouseDown={(e) => handleResizeStart(e, dir)}
                    className={`absolute z-20 touch-none select-none ${className}`}
                />
            ))}
        </div>
    );
}

import { useEffect, useRef, useState } from "react";
import { useAppStore } from "../store.jsx";

const DEFAULT_MIN_W = 150;
const DEFAULT_MIN_H = 130;

export default function WidgetsWindow({
    id,
    title,
    closeWidget,
    children,
    desktopRef,
    icon,
    x,
    y,
    width,
    height,
    minWidth = DEFAULT_MIN_W,
    minHeight = DEFAULT_MIN_H,
}) {
    const windowRef = useRef(null);

    const [isDragging, setIsDragging] = useState(false);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [resizeDir, setResizeDir] = useState(null);
    const resizeStart = useRef(null);

    const setWidgetPosition = useAppStore((state) => state.setWidgetPosition);
    const setWidgetSize = useAppStore((state) => state.setWidgetSize);
    const isWidgetsMenuOpen = useAppStore((state) => state.isWidgetsMenuOpen);

    const curW = width ?? 280;
    const curH = height ?? 260;

    const handleMouseDown = (e) => {
        if (e.button !== 0 || !isWidgetsMenuOpen) return;
        setIsDragging(true);
        setOffset({
            x: e.clientX - x,
            y: e.clientY - y,
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseMove = (e) => {
        if (
            !isDragging || !windowRef.current || !desktopRef?.current
        ) {
            return;
        }

        const windowWidth = windowRef.current.offsetWidth;
        const windowHeight = windowRef.current.offsetHeight;

        const desktopWidth = desktopRef.current.clientWidth;
        const desktopHeight = desktopRef.current.clientHeight;

        const newX = e.clientX - offset.x;
        const newY = e.clientY - offset.y;

        const maxX = Math.max(0, desktopWidth - windowWidth);
        const maxY = Math.max(0, desktopHeight - windowHeight);

        setWidgetPosition(
            id,
            Math.max(0, Math.min(newX, maxX)),
            Math.max(0, Math.min(newY, maxY))
        );
    };

    useEffect(() => {
        if (!isDragging) return;

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isDragging, offset]);

    const handleResizeStart = (e, dir) => {
        if (e.button !== 0 || !isWidgetsMenuOpen) return;
        e.stopPropagation();
        e.preventDefault();
        setResizeDir(dir);
        resizeStart.current = {
            mouseX: e.clientX,
            mouseY: e.clientY,
            x,
            y,
            w: curW,
            h: curH,
        };
    };

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
                newW = Math.min(Math.max(start.w + dx, minWidth), desktopWidth - start.x);
            }
            if (resizeDir.includes("s")) {
                newH = Math.min(Math.max(start.h + dy, minHeight), desktopHeight - start.y);
            }
            if (resizeDir.includes("w")) {
                const clampedX = Math.min(Math.max(start.x + dx, 0), start.x + start.w - minWidth);
                newW = start.w + (start.x - clampedX);
                newX = clampedX;
            }
            if (resizeDir.includes("n")) {
                const clampedY = Math.min(Math.max(start.y + dy, 0), start.y + start.h - minHeight);
                newH = start.h + (start.y - clampedY);
                newY = clampedY;
            }

            newW = Math.max(Math.round(newW), minWidth);
            newH = Math.max(Math.round(newH), minHeight);

            if (newX !== x || newY !== y) {
                setWidgetPosition(id, Math.round(newX), Math.round(newY));
            }
            setWidgetSize(id, newW, newH);
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
    }, [resizeDir]);

    const edgeHandles = [
        { dir: "e", className: "top-3 bottom-3 right-0 w-2 cursor-e-resize" },
        { dir: "w", className: "top-3 bottom-3 left-0 w-2 cursor-w-resize" },
        { dir: "s", className: "left-3 right-3 bottom-0 h-2 cursor-s-resize" },
        { dir: "n", className: "left-3 right-3 top-0 h-2 cursor-n-resize" },
    ];

    const cornerHandles = [
        { dir: "se", className: "bottom-0 right-0 w-4 h-4 cursor-se-resize" },
        { dir: "sw", className: "bottom-0 left-0 w-4 h-4 cursor-sw-resize" },
        { dir: "ne", className: "top-0 right-0 w-4 h-4 cursor-ne-resize" },
        { dir: "nw", className: "top-0 left-0 w-4 h-4 cursor-nw-resize" },
    ];

    return (
        <div
            ref={windowRef}
            className="group/widget absolute flex flex-col bg-white/10 backdrop-blur-xl rounded-xl p-1 overflow-hidden"
            style={{
                left: `${x}px`,
                top: `${y}px`,
                width: width ? `${width}px` : "auto",
                height: height ? `${height}px` : "auto",
                zIndex: 0,
                backgroundColor: isWidgetsMenuOpen ? "#ffffffcc" : "#FFFFFF3D"
            }}
        >
            <div
                onMouseDown={handleMouseDown}
                className="flex items-center justify-between px-3 py-2 cursor-grab active:cursor-grabbing select-none shrink-0"
                style={{
                    display: isWidgetsMenuOpen ? "flex" : "none"
                }}
            >
                <div className="flex items-center gap-2">
                    {icon && (
                        <img
                            src={icon}
                            alt=""
                            className="w-5 h-5 object-contain"
                        />
                    )}

                    <span className="text-xs text-neutral-500">
                        {title}
                    </span>
                </div>

                <button
                    type="button"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={() => closeWidget?.(id)}
                    className="flex items-center justify-center w-3 h-3 rounded-full bg-red-300 hover:text-white transition-colors"
                />
            </div>

            <div className="flex-1 min-h-0 min-w-0 overflow-auto rounded-lg">
                {children}
            </div>

            {isWidgetsMenuOpen && edgeHandles.map(({ dir, className }) => (
                <div
                    key={dir}
                    onMouseDown={(e) => handleResizeStart(e, dir)}
                    className={`absolute z-10 opacity-0 group-hover/widget:opacity-100 transition-opacity select-none ${className}`}
                />
            ))}
            {isWidgetsMenuOpen && cornerHandles.map(({ dir, className }) => (
                <div
                    key={dir}
                    onMouseDown={(e) => handleResizeStart(e, dir)}
                    className={`absolute z-10 select-none ${className} ${dir === "se" ? "opacity-60 group-hover/widget:opacity-100" : "opacity-0 group-hover/widget:opacity-100"} transition-opacity`}
                />
            ))}
            {isWidgetsMenuOpen && (
            <div className="absolute bottom-1 right-1 z-0 pointer-events-none opacity-50 group-hover/widget:opacity-100 transition-opacity">
                <svg width="10" height="10" viewBox="0 0 10 10" className="text-neutral-600">
                    <path d="M9 1 L1 9 M9 5 L5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
            </div>
            )}
        </div>
    );
}

import { useEffect, useRef, useState } from "react";
import { useAppStore } from "../store.jsx";

export default function WidgetsWindow({
    id,
    title,
    closeWidget,
    children,
    desktopRef,
    zIndex = 50,
    icon,
    windowState = "normal",
    x = 0,
    y = 0,
    width = 300,
    height = 200,
}) {
    const windowRef = useRef(null);

    const [isDragging, setIsDragging] = useState(false);
    const [offset, setOffset] = useState({ x: 0, y: 0 });

    const setWidgetPosition = useAppStore((state) => state.setWidgetPosition);
    const bringToFrontWidget = useAppStore((state) => state.bringToFrontWidget);


    const handleMouseDown = (e) => {
        if (e.button !== 0) return;

        setIsDragging(true);

        setOffset({
            x: e.clientX - x,
            y: e.clientY - y,
        });

        bringToFrontWidget(id)
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

    return (
        <div
            ref={windowRef}
            className="absolute bg-white/80 backdrop-blur-xl rounded-xl shadow-xl overflow-hidden"
            style={{
                left: `${x}px`,
                top: `${y}px`,
                width: `${width}px`,
                height: `${height}px`,
                zIndex,
            }}
        >
            {/* Header */}
            <div
                onMouseDown={handleMouseDown}
                className="flex items-center justify-between px-3 py-2 cursor-grab active:cursor-grabbing select-none bg-white/40"
            >
                <div className="flex items-center gap-2">
                    {icon && (
                        <img
                            src={icon}
                            alt=""
                            className="w-5 h-5 object-contain"
                        />
                    )}

                    <span className="font-medium">
                        {title}
                    </span>
                </div>

                <button
                    type="button"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={() => closeWidget?.(id)}
                    className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-red-500 hover:text-white transition-colors"
                >
                    ×
                </button>
            </div>

            <div className="flex-1 overflow-hidden">
                {children}
            </div>
        </div>
    );
}
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
    x,
    y,
    width,
    height,
}) {
    const windowRef = useRef(null);

    const [isDragging, setIsDragging] = useState(false);
    const [offset, setOffset] = useState({ x: 0, y: 0 });

    const setWidgetPosition = useAppStore((state) => state.setWidgetPosition);
    const bringToFrontWidget = useAppStore((state) => state.bringToFrontWidget);
    const isWidgetsMenuOpen = useAppStore((state) => state.isWidgetsMenuOpen);

    console.log(isWidgetsMenuOpen)


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

        isWidgetsMenuOpen ? setIsDragging(true) : setIsDragging(false)
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
            className="absolute bg-white/80 backdrop-blur-xl rounded-xl p-1 resize overflow-hidden"
            style={{
                left: `${x}px`,
                top: `${y}px`,
                width: `${width}px`,
                height: `${height}px`,
                zIndex,
            }}
        >
            <div
                onMouseDown={handleMouseDown}
                className="flex items-center justify-between px-3 py-2 cursor-grab select-none active:cursor-grabbing bg-white/40"
            />
            <div className="flex-1">
                {children}
            </div>
        </div>
    );
}
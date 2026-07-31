import { XIcon } from "@phosphor-icons/react";
import { useState, useEffect, useRef } from "react";
import { useAppStore } from '../store.jsx';

export default function Window({
    id,
    title,
    closeApp,
    children,
    desktopRef,
    zIndex,
    icon
}) {
    const windowRef = useRef(null);
    const [position, setPosition] = useState({ x: 350, y: 100, });
    const [isMinimized, setIsMinimized] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [offset, setOffset] = useState({ x: 0, y: 0, });
    const bringToFront = useAppStore((state) => state.bringToFront)

    const handleMouseDown = (e) => {
        setIsDragging(true);

        setOffset({
            x: e.clientX - position.x,
            y: e.clientY - position.y,
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

        setPosition({
            x: Math.max(0, Math.min(newX, desktopWidth - windowWidth)),
            y: Math.max(0, Math.min(newY, desktopHeight - windowHeight)),
        });
    };

    const minimizeApp = () => {
        setIsMinimized(prev => !prev);
    }

    useEffect(() => {
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
            className={`bg-white/50 backdrop-blur-2xl text-black p-2 rounded-lg ${isMinimized ? "close-app" : "open-app"}`}
            style={{
                position: "absolute",
                left: `${position.x}px`,
                top: `${position.y}px`,
                zIndex: zIndex,
                userSelect: "none"
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
                        onClick={minimizeApp}
                        className="bg-green-400 text-white font-bold rounded-full p-2 cursor-pointer"
                    >

                    </button>
                    <button
                        className="bg-amber-400 text-white font-bold rounded-full p-2 cursor-pointer"
                    >

                    </button>
                    <button
                        onClick={closeApp}
                        className="bg-red-400 text-white font-bold rounded-full p-2 cursor-pointer"
                    >

                    </button>
                </div>
            </div>
            <div>
                {children}
            </div>
        </div>
    );
}
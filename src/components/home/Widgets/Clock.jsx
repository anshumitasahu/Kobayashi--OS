import { useState, useEffect } from "react";
import { useContainerSize } from "../../../lib/Widgets/useContainerSize";

export default function Clock() {
    const [time, setTime] = useState(new Date());
    const [ref, { width, height }] = useContainerSize();

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000)
        return () => clearInterval(timer);
    }, [])

    const hours = time.getHours();
    const minutes = time.getMinutes();
    const seconds = time.getSeconds();

    const hourAngle = (hours % 12) * 30 + minutes * 0.5;
    const minuteAngle = minutes * 6;
    const secondAngle = seconds * 6;

    const size = Math.max(72, Math.min(width || 160, height || 160));
    const ring = Math.max(3, size * 0.022);
    const handW = Math.max(2, size * 0.022);

    const hand = (angle, lenPct, w, color) => ({
        position: "absolute",
        bottom: "50%",
        left: "50%",
        width: w,
        height: `${lenPct}%`,
        backgroundColor: color,
        borderRadius: 999,
        transform: `translateX(-50%) rotate(${angle}deg)`,
        transformOrigin: "bottom center",
    });

    return (
        <div ref={ref} className="w-full h-full min-w-0 min-h-0 flex items-center justify-center p-2">
            <div
                className="rounded-full shrink-0"
                style={{
                    width: size,
                    height: size,
                    border: `${ring}px solid #bea998`,
                    padding: size * 0.045,
                    backgroundColor: "#e4d9cf",
                }}
            >
                <div className="rounded-full w-full h-full bg-[#eee7e0] relative overflow-hidden">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div
                            key={i}
                            style={{
                                position: "absolute",
                                inset: 0,
                                transform: `rotate(${i * 30}deg)`,
                            }}
                        >
                            <div
                                style={{
                                    position: "absolute",
                                    top: "3%",
                                    left: "50%",
                                    width: Math.max(1.5, size * 0.012),
                                    height: i % 3 === 0 ? "9%" : "5%",
                                    backgroundColor: "#a89c90",
                                    borderRadius: 999,
                                    transform: "translateX(-50%)",
                                }}
                            />
                        </div>
                    ))}
                    <div style={hand(hourAngle, 25, handW, "#1c1c1e")} />
                    <div style={hand(minuteAngle, 35, handW * 0.8, "#1c1c1e")} />
                    <div style={hand(secondAngle, 40, Math.max(1, handW * 0.45), "#c0392b")} />
                    <div
                        style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            width: Math.max(6, size * 0.06),
                            height: Math.max(6, size * 0.06),
                            backgroundColor: "#292827",
                            borderRadius: 999,
                            transform: "translate(-50%, -50%)",
                        }}
                    />
                </div>
            </div>
        </div>
    )
}

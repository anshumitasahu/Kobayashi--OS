import { useState, useEffect } from "react";
import { useContainerSize } from "../../../lib/Widgets/useContainerSize";

function Hand({ angle, length, width, color, tail = 0 }) {
    return (
        <div className="absolute inset-0" style={{ transform: `rotate(${angle}deg)` }}>
            <div
                className="absolute left-1/2"
                style={{
                    bottom: "50%",
                    width,
                    height: `${length}%`,
                    backgroundColor: color,
                    borderRadius: 999,
                    transform: "translateX(-50%)",
                }}
            />
            {tail > 0 && (
                <div
                    className="absolute left-1/2"
                    style={{
                        top: "50%",
                        width,
                        height: `${tail}%`,
                        backgroundColor: color,
                        borderRadius: 999,
                        transform: "translateX(-50%)",
                    }}
                />
            )}
        </div>
    );
}

export default function Clock() {
    const [time, setTime] = useState(new Date());
    const [ref, { width, height }] = useContainerSize();

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000)
        return () => clearInterval(timer);
    }, [])

    const seconds = time.getSeconds();
    const minutes = time.getMinutes() + seconds / 60;
    const hours = (time.getHours() % 12) + minutes / 60;

    const size = Math.max(72, Math.min(width || 160, height || 160) - 14);
    const w = Math.max(2, size * 0.032);

    return (
        <div ref={ref} className="@container w-full h-full min-w-0 min-h-0">
            <div className="w-full h-full flex items-center justify-center bg-white/60 backdrop-blur-2xl border border-white/70 rounded-[26px] shadow-[0_8px_24px_rgba(0,0,0,0.12)] overflow-hidden">
                <div
                    className="relative rounded-full shrink-0"
                    style={{
                        width: size,
                        height: size,
                        backgroundColor: "#1c1c1e",
                        border: `${Math.max(1.5, size * 0.012)}px solid rgba(255,255,255,0.5)`,
                        boxShadow: "inset 0 2px 12px rgba(0,0,0,0.6)",
                    }}
                >
                    {Array.from({ length: 60 }).map((_, i) => (
                        <div key={i} className="absolute inset-0" style={{ transform: `rotate(${i * 6}deg)` }}>
                            <div
                                className="absolute left-1/2 top-[3%] -translate-x-1/2 rounded-full"
                                style={{
                                    width: i % 5 === 0 ? Math.max(2, size * 0.02) : Math.max(1, size * 0.008),
                                    height: i % 5 === 0 ? "7%" : "3.5%",
                                    backgroundColor: i % 5 === 0 ? "#f5f5f7" : "rgba(245,245,247,0.45)",
                                }}
                            />
                        </div>
                    ))}
                    <Hand angle={hours * 30} length={24} width={w} color="#f5f5f7" />
                    <Hand angle={minutes * 6} length={34} width={w * 0.75} color="#f5f5f7" />
                    <Hand angle={seconds * 6} length={38} width={Math.max(1, w * 0.35)} color="#ff9f0a" tail={9} />
                    <div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ff9f0a]"
                        style={{ width: Math.max(6, size * 0.055), height: Math.max(6, size * 0.055) }}
                    />
                </div>
            </div>
        </div>
    )
}

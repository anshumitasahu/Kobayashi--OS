import { useEffect, useState } from "react";
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

const NUMERALS = [
    ["12", "top-[6%] left-1/2 -translate-x-1/2"],
    ["3", "right-[7%] top-1/2 -translate-y-1/2"],
    ["6", "bottom-[6%] left-1/2 -translate-x-1/2"],
    ["9", "left-[7%] top-1/2 -translate-y-1/2"],
];

export default function SonomaClock() {
    const [now, setNow] = useState(() => new Date());
    const [ref, { width, height }] = useContainerSize();

    useEffect(() => {
        const t = setInterval(() => setNow(new Date()), 100);
        return () => clearInterval(t);
    }, []);

    const seconds = now.getSeconds() + now.getMilliseconds() / 1000;
    const minutes = now.getMinutes() + seconds / 60;
    const hours = (now.getHours() % 12) + minutes / 60;

    const size = Math.max(84, Math.min(width || 220, height || 220) - 14);
    const w = Math.max(2, size * 0.032);

    return (
        <div ref={ref} className="@container w-full h-full min-w-0 min-h-0">
            <div className="w-full h-full flex items-center justify-center bg-white/60 backdrop-blur-2xl border border-white/70 rounded-[26px] shadow-[0_8px_24px_rgba(0,0,0,0.12)] overflow-hidden">
                <div
                    className="relative rounded-full shrink-0"
                    style={{
                        width: size,
                        height: size,
                        backgroundColor: "#fdf8f0",
                        border: `${Math.max(1.5, size * 0.012)}px solid #e2dccf`,
                        boxShadow: "inset 0 2px 10px rgba(0,0,0,0.08)",
                    }}
                >
                    {Array.from({ length: 60 }).map((_, i) => (
                        <div key={i} className="absolute inset-0" style={{ transform: `rotate(${i * 6}deg)` }}>
                            <div
                                className="absolute left-1/2 top-[3%] -translate-x-1/2 rounded-full"
                                style={{
                                    width: i % 5 === 0 ? Math.max(2, size * 0.02) : Math.max(1, size * 0.008),
                                    height: i % 5 === 0 ? "7%" : "3.5%",
                                    backgroundColor: "#3a3a3c",
                                }}
                            />
                        </div>
                    ))}
                    {NUMERALS.map(([n, pos]) => (
                        <span key={n} className={`absolute ${pos} font-semibold text-neutral-900 leading-none text-[clamp(10px,8cqw,20px)]`}>
                            {n}
                        </span>
                    ))}
                    <Hand angle={hours * 30} length={24} width={w} color="#1c1c1e" />
                    <Hand angle={minutes * 6} length={34} width={w * 0.75} color="#1c1c1e" />
                    <Hand angle={seconds * 6} length={38} width={Math.max(1, w * 0.35)} color="#ff9500" tail={9} />
                    <div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neutral-900"
                        style={{ width: Math.max(6, size * 0.055), height: Math.max(6, size * 0.055) }}
                    />
                </div>
            </div>
        </div>
    );
}

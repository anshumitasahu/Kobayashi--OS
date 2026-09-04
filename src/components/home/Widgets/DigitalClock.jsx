import { useEffect, useState } from "react";
import { loadWidgetSettings, saveWidgetSetting } from "../../../lib/Widgets/widgetSettings";

const STYLES = ["glass", "minimal", "bold"];

function useNow() {
    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const t = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(t);
    }, []);
    return now;
}

export function DigitalClockGlass() {
    const now = useNow();
    const time = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
    const date = now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-0.5 rounded-xl bg-white/20 backdrop-blur-xl border border-white/40 p-3 shadow-lg">
            <p className="text-3xl font-bold tabular-nums text-white drop-shadow">{time}</p>
            <p className="text-xs font-medium text-white/80">{date}</p>
        </div>
    );
}

export function DigitalClockMinimal() {
    const now = useNow();
    const time = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
    const date = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
    return (
        <div className="w-full h-full flex flex-col items-start justify-center gap-0.5 bg-[#1c1c1e] rounded-xl p-4">
            <p className="text-3xl font-light tabular-nums text-neutral-100">{time}</p>
            <p className="text-[11px] text-neutral-400">{date}</p>
        </div>
    );
}

export function DigitalClockBold() {
    const now = useNow();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const ss = String(now.getSeconds()).padStart(2, "0");
    return (
        <div className="w-full h-full flex items-center justify-center gap-1 rounded-xl p-3" style={{ background: "linear-gradient(135deg,#6366f1,#a855f7,#ec4899)" }}>
            {[hh, mm, ss].map((unit, i) => (
                <div key={i} className="flex items-center gap-1">
                    <span className="text-3xl font-black tabular-nums text-white drop-shadow">{unit}</span>
                    {i < 2 && <span className="text-2xl font-black text-white/60">:</span>}
                </div>
            ))}
        </div>
    );
}

export default function DigitalClock() {
    const [style, setStyle] = useState(() => loadWidgetSettings()["digital-clock"] || "glass");

    const cycle = () => {
        const next = STYLES[(STYLES.indexOf(style) + 1) % STYLES.length];
        setStyle(next);
        saveWidgetSetting("digital-clock", next);
    };

    return (
        <div className="w-full h-full relative group/clock" onDoubleClick={cycle} title="Double-click to change style">
            {style === "minimal" ? <DigitalClockMinimal /> : style === "bold" ? <DigitalClockBold /> : <DigitalClockGlass />}
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 group-hover/clock:opacity-100 transition-opacity">
                {STYLES.map((s) => (
                    <button
                        key={s}
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={() => { setStyle(s); saveWidgetSetting("digital-clock", s); }}
                        className={`w-2 h-2 rounded-full ${style === s ? "bg-white" : "bg-white/40"}`}
                    />
                ))}
            </div>
        </div>
    );
}

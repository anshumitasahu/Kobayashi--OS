import { useEffect, useState } from "react";
import { loadWidgetSettings, saveWidgetSetting } from "../../../lib/Widgets/widgetSettings";

const STYLES = ["light", "dark"];

function useToday() {
    const [today, setToday] = useState(() => new Date());
    useEffect(() => {
        const t = setInterval(() => setToday(new Date()), 30_000);
        return () => clearInterval(t);
    }, []);
    return today;
}

export function SonomaDateLight() {
    const today = useToday();
    const weekday = today.toLocaleDateString(undefined, { weekday: "short" });
    const month = today.toLocaleDateString(undefined, { month: "short" });
    const day = today.getDate();
    const isSun = today.getDay() === 0;
    return (
        <div className="w-full h-full min-w-0 min-h-0 flex flex-col items-center justify-center bg-[#f8f7f4]/95 rounded-[26px] border border-white/70 shadow-[0_8px_24px_rgba(0,0,0,0.12)] overflow-hidden leading-none">
            <p className="font-semibold tracking-tight whitespace-nowrap text-[clamp(11px,10cqw,26px)]">
                <span style={{ color: isSun ? "#ff3b30" : "#ff3b30" }}>{weekday}</span>
                <span className="text-neutral-500"> {month}</span>
            </p>
            <p className="font-semibold tabular-nums text-neutral-900 leading-none tracking-tighter text-[clamp(44px,46cqw,120px)]">
                {day}
            </p>
        </div>
    );
}

export function SonomaDateDark() {
    const today = useToday();
    const weekday = today.toLocaleDateString(undefined, { weekday: "long" });
    const day = today.getDate();
    return (
        <div className="w-full h-full min-w-0 min-h-0 flex flex-col items-start justify-center gap-[1cqw] bg-[#2c2c2e]/95 rounded-[26px] shadow-[0_8px_24px_rgba(0,0,0,0.25)] overflow-hidden px-[9cqw] leading-none">
            <p className="font-semibold text-[#ffb340] whitespace-nowrap text-[clamp(10px,8cqw,22px)]">
                {weekday}
            </p>
            <p className="font-bold tabular-nums text-white leading-none tracking-tight text-[clamp(40px,36cqw,96px)]">
                {day}
            </p>
        </div>
    );
}

export default function SonomaDate() {
    const [style, setStyle] = useState(() => loadWidgetSettings()["sonoma-date"] || "light");
    const cycle = () => {
        const next = STYLES[(STYLES.indexOf(style) + 1) % STYLES.length];
        setStyle(next);
        saveWidgetSetting("sonoma-date", next);
    };
    return (
        <div className="@container w-full h-full min-w-0 min-h-0 relative group/sonoma-date" onDoubleClick={cycle} title="Double-click to change style">
            {style === "dark" ? <SonomaDateDark /> : <SonomaDateLight />}
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 group-hover/sonoma-date:opacity-100 transition-opacity">
                {STYLES.map((s) => (
                    <button
                        key={s}
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={() => { setStyle(s); saveWidgetSetting("sonoma-date", s); }}
                        className={`w-2 h-2 rounded-full ${style === s ? (style === "light" ? "bg-neutral-800" : "bg-white") : (style === "light" ? "bg-neutral-400/60" : "bg-white/40")}`}
                    />
                ))}
            </div>
        </div>
    );
}

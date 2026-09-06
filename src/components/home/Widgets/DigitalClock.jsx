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

function parts(now) {
    const hour12 = now.toLocaleTimeString("en-US", { hour: "numeric", hour12: true });
    const [hm, ampm] = hour12.split(" ");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const hh = hm.split(":")[0];
    const ss = String(now.getSeconds()).padStart(2, "0");
    return { hm: `${hh}:${mm}`, ss, ampm };
}

export function DigitalClockGlass() {
    const now = useNow();
    const { hm, ss, ampm } = parts(now);
    const date = now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    return (
        <div className="w-full h-full min-w-0 min-h-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-2xl border border-white/70 rounded-[26px] shadow-[0_8px_24px_rgba(0,0,0,0.12)] overflow-hidden leading-none">
            <p className="font-semibold tracking-tighter tabular-nums text-neutral-900 whitespace-nowrap text-[clamp(28px,17cqw,64px)]">
                {hm}
                <span className="font-medium text-neutral-400 text-[clamp(13px,7cqw,26px)]">:{ss}</span>
                <span className="ml-[1.5cqw] font-semibold text-[#ff3b30] text-[clamp(11px,5cqw,20px)]">{ampm}</span>
            </p>
            <p className="mt-[1.5cqw] font-medium text-neutral-500 whitespace-nowrap text-[clamp(9px,3.8cqw,15px)]">{date}</p>
        </div>
    );
}

export function DigitalClockMinimal() {
    const now = useNow();
    const { hm, ss, ampm } = parts(now);
    const date = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
    return (
        <div className="w-full h-full min-w-0 min-h-0 flex flex-col items-start justify-center gap-[1cqw] bg-[#2c2c2e]/95 rounded-[26px] shadow-[0_8px_24px_rgba(0,0,0,0.25)] px-[8cqw] overflow-hidden leading-none">
            <p className="font-semibold tracking-tighter tabular-nums text-white whitespace-nowrap text-[clamp(28px,17cqw,64px)]">
                {hm}
                <span className="font-medium text-white/40 text-[clamp(13px,7cqw,26px)]">:{ss}</span>
            </p>
            <p className="font-semibold text-[#ffb340] whitespace-nowrap text-[clamp(9px,3.8cqw,15px)]">
                {ampm} · {date}
            </p>
        </div>
    );
}

export function DigitalClockBold() {
    const now = useNow();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const ss = String(now.getSeconds()).padStart(2, "0");
    const colon = now.getSeconds() % 2 === 0;
    return (
        <div className="w-full h-full min-w-0 min-h-0 flex items-center justify-center gap-[1.5cqw] bg-[#f8f7f4]/95 rounded-[26px] border border-white/70 shadow-[0_8px_24px_rgba(0,0,0,0.12)] overflow-hidden leading-none">
            {[hh, mm].map((unit, i) => (
                <span key={i} className="font-bold tabular-nums tracking-tighter text-neutral-900 text-[clamp(30px,19cqw,72px)]">
                    {unit}{i === 0 && <span className={colon ? "text-[#ff3b30]" : "text-neutral-300"}>:</span>}
                </span>
            ))}
            <span className="self-start mt-[6cqw] font-semibold tabular-nums text-neutral-400 text-[clamp(11px,5cqw,20px)]">{ss}</span>
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
        <div className="@container w-full h-full min-w-0 min-h-0 relative group/clock" onDoubleClick={cycle} title="Double-click to change style">
            {style === "minimal" ? <DigitalClockMinimal /> : style === "bold" ? <DigitalClockBold /> : <DigitalClockGlass />}
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 group-hover/clock:opacity-100 transition-opacity">
                {STYLES.map((s) => (
                    <button
                        key={s}
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={() => { setStyle(s); saveWidgetSetting("digital-clock", s); }}
                        className={`w-2 h-2 rounded-full ${style === s ? (style === "minimal" ? "bg-white" : "bg-neutral-800") : (style === "minimal" ? "bg-white/40" : "bg-neutral-400/60")}`}
                    />
                ))}
            </div>
        </div>
    );
}

import { useCallback, useEffect, useState } from "react";
import { readWeatherCache, readWeatherHistory } from "../../../lib/Widgets/widgetSettings";

const apiKey = () => import.meta.env.VITE_WEATHER_API_KEY;

const CONDITION_ART = {
    rain: {
        sky: "linear-gradient(180deg,#7aa5d2 0%,#a9c6e4 45%,#cfe0f2 100%)",
        sun: true,
        cloud: "white",
        drops: ["#1e88e5", "#1e88e5", "#1e88e5"],
        label: "Rain",
    },
    drizzle: {
        sky: "linear-gradient(180deg,#7aa5d2 0%,#a9c6e4 45%,#cfe0f2 100%)",
        sun: true,
        cloud: "white",
        drops: ["#1e88e5", "#1e88e5", "#1e88e5"],
        label: "Drizzle",
    },
    thunderstorm: {
        sky: "linear-gradient(180deg,#5b6b8c 0%,#8fa1c0 50%,#c3cede 100%)",
        sun: false,
        cloud: "#f1f4f9",
        drops: ["#0d47a1", "#0d47a1", "#0d47a1"],
        label: "Storm",
    },
    snow: {
        sky: "linear-gradient(180deg,#8fa8c8 0%,#bccde4 50%,#e3ecf6 100%)",
        sun: true,
        cloud: "white",
        drops: ["#90caf9", "#90caf9", "#90caf9"],
        label: "Snow",
    },
    clear: {
        sky: "linear-gradient(180deg,#3f9be0 0%,#7cc3ef 55%,#c9e7fa 100%)",
        sun: true,
        cloud: "white",
        drops: [],
        label: "Clear",
    },
    clouds: {
        sky: "linear-gradient(180deg,#6fa8dc 0%,#9cc3e8 50%,#cfe3f5 100%)",
        sun: true,
        cloud: "white",
        drops: [],
        label: "Cloudy",
    },
    mist: {
        sky: "linear-gradient(180deg,#9db3c8 0%,#bccddd 55%,#dde7f1 100%)",
        sun: false,
        cloud: "#eef3f8",
        drops: [],
        label: "Fog",
    },
};

function artFor(data) {
    const main = data?.weather?.[0]?.main?.toLowerCase() ?? "";
    if (["rain", "drizzle", "thunderstorm", "snow"].includes(main)) return CONDITION_ART[main];
    if (main === "clear") return CONDITION_ART.clear;
    if (main === "clouds") return CONDITION_ART.clouds;
    if (["mist", "fog", "haze", "smoke", "dust", "ash", "squall", "tornado"].includes(main)) return CONDITION_ART.mist;
    return null;
}

const DEFAULT_ART = {
    sky: "linear-gradient(180deg,#f6a45c 0%,#f7c873 35%,#dbeaf7 100%)",
    sun: true,
    cloud: "white",
    drops: ["#1e88e5", "#1e88e5", "#1e88e5"],
    label: null,
};

export default function SonomaWeather() {
    const [data, setData] = useState(readWeatherCache);

    const fetchFor = useCallback(async (query) => {
        const key = apiKey();
        if (!key) return;
        try {
            const q = typeof query === "string" ? `q=${encodeURIComponent(query)}` : `lat=${query.lat}&lon=${query.lon}`;
            const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?${q}&appid=${key}&units=metric`);
            if (!res.ok) return;
            const json = await res.json();
            const snapshot = { ...json, _at: Date.now() };
            setData(snapshot);
            try { localStorage.setItem("koba-weather-cache", JSON.stringify(snapshot)); } catch { /* ignore */ }
        } catch { /* ignore */ }
    }, []);

    useEffect(() => {
        if (data) return;
        const history = readWeatherHistory();
        if (history.length > 0) fetchFor(history[0]);
    }, [data, fetchFor]);

    const art = artFor(data) ?? DEFAULT_ART;
    const temp = data ? Math.round(data.main.temp) : null;

    return (
        <div className="@container relative w-full h-full min-w-0 min-h-0 rounded-[26px] overflow-hidden border border-white/60 shadow-[0_8px_24px_rgba(0,0,0,0.12)]" style={{ background: art.sky }}>
            <div className="absolute inset-0 pointer-events-none">
                {art.sun && (
                    <div
                        className="absolute rounded-full"
                        style={{
                            width: "62%", aspectRatio: "1", right: "-12%", top: "2%",
                            background: "radial-gradient(circle at 35% 35%, #fff3c4 0%, #ffd66e 45%, #f5a623 100%)",
                            boxShadow: "0 0 24px rgba(255,180,60,0.55)",
                        }}
                    />
                )}
                <div className="absolute left-1/2 -translate-x-1/2" style={{ top: art.sun ? "16%" : "8%", width: "96%" }}>
                    <svg viewBox="0 0 200 110" className="w-full h-auto drop-shadow-[0_6px_10px_rgba(0,0,0,0.15)]">
                        <ellipse cx="100" cy="78" rx="82" ry="26" fill={art.cloud} />
                        <circle cx="58" cy="60" r="28" fill={art.cloud} />
                        <circle cx="95" cy="48" r="34" fill={art.cloud} />
                        <circle cx="134" cy="58" r="30" fill={art.cloud} />
                    </svg>
                </div>
                {art.drops.length > 0 && (
                    <div className="absolute left-1/2 -translate-x-1/2 flex gap-[9cqw]" style={{ top: "74%" }}>
                        {art.drops.map((c, i) => (
                            <svg key={i} viewBox="0 0 20 28" style={{ width: "clamp(10px,7cqw,20px)", height: "clamp(14px,9.5cqw,27px)" }}>
                                <path d="M10 1 C10 1 2 14 2 20 a8 8 0 0 0 16 0 C18 14 10 1 10 1 Z" fill={c} />
                            </svg>
                        ))}
                    </div>
                )}
            </div>
            {(temp !== null || art.label || data) && (
                <div className="absolute left-[5cqw] bottom-[4cqw] leading-none">
                    {temp !== null && (
                        <p className="font-semibold text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)] tabular-nums text-[clamp(20px,13cqw,40px)]">
                            {temp}°
                        </p>
                    )}
                    <p className="text-white/95 drop-shadow-[0_1px_4px_rgba(0,0,0,0.35)] capitalize truncate text-[clamp(8px,3.6cqw,13px)]">
                        {data ? data.weather?.[0]?.description : art.label}
                    </p>
                </div>
            )}
        </div>
    );
}

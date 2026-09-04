import { useCallback, useEffect, useState } from "react";
import { MapPinIcon, ArrowClockwiseIcon } from "@phosphor-icons/react";
import { readWeatherCache, readWeatherHistory } from "../../../lib/Widgets/widgetSettings";

const CACHE_KEY = "koba-weather-cache";

export default function WeatherGlass() {
    const [data, setData] = useState(readWeatherCache);
    const [loading, setLoading] = useState(false);

    const apiKey = import.meta.env.VITE_WEATHER_API_KEY;

    const fetchFor = useCallback(async (query) => {
        if (!apiKey) return;
        setLoading(true);
        try {
            const q = typeof query === "string" ? `q=${encodeURIComponent(query)}` : `lat=${query.lat}&lon=${query.lon}`;
            const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?${q}&appid=${apiKey}&units=metric`);
            if (!res.ok) return;
            const json = await res.json();
            const snapshot = { ...json, _at: Date.now() };
            setData(snapshot);
            try { localStorage.setItem(CACHE_KEY, JSON.stringify(snapshot)); } catch { /* ignore */ }
        } catch { /* ignore */ } finally {
            setLoading(false);
        }
    }, [apiKey]);

    useEffect(() => {
        if (data) return;
        const history = readWeatherHistory();
        if (history.length > 0 && apiKey) fetchFor(history[0]);
    }, [apiKey, data, fetchFor]);

    const refresh = () => {
        const history = readWeatherHistory();
        if (history.length > 0) fetchFor(history[0]);
        else if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => fetchFor({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
                () => {},
                { timeout: 8000 }
            );
        }
    };

    const temp = data ? Math.round(data.main.temp) : null;
    const icon = data?.weather?.[0]?.icon
        ? `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`
        : "./weather2.png";

    return (
        <div className="@container relative w-full h-full min-w-0 min-h-0 rounded-xl overflow-hidden">
            <img src="./weather2.png" alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-sky-900/30 via-transparent to-slate-900/50" />
            <div className="relative h-full min-h-0 flex flex-col justify-between p-[3.5cqw]">
                <div className="flex items-start justify-between gap-[2cqw]">
                    <span className="inline-flex min-w-0 items-center gap-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 px-[2.5cqw] py-[1cqw] font-medium text-white text-[clamp(8px,3.4cqw,12px)]">
                        <MapPinIcon size={11} className="shrink-0" />
                        <span className="truncate">{data ? `${data.name}${data.sys?.country ? `, ${data.sys.country}` : ""}` : "Weather"}</span>
                    </span>
                    <button
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={refresh}
                        title="Refresh"
                        className="shrink-0 rounded-full bg-white/20 backdrop-blur-md border border-white/30 p-[1.8cqw] text-white hover:bg-white/30 active:scale-95"
                    >
                        <ArrowClockwiseIcon size={12} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
                <div className="flex items-end justify-between gap-[2cqw] min-h-0">
                    <div className="min-w-0">
                        <p className="font-bold text-white drop-shadow-lg tabular-nums leading-none text-[clamp(22px,12cqw,44px)]">
                            {temp !== null ? `${temp}°` : "--°"}
                        </p>
                        <p className="text-white/85 capitalize truncate text-[clamp(8px,3.4cqw,13px)]">
                            {data ? data.weather?.[0]?.description : (apiKey ? "Open Weather app to load" : "Missing API key")}
                        </p>
                        {data && (
                            <p className="text-white/70 truncate text-[clamp(7px,3cqw,12px)]">
                                H:{Math.round(data.main.temp_max)}° L:{Math.round(data.main.temp_min)}° · 💧{data.main.humidity}%
                            </p>
                        )}
                    </div>
                    <img src={icon} alt="" className="shrink-0 object-contain drop-shadow-lg w-[clamp(36px,17cqw,64px)] h-[clamp(36px,17cqw,64px)]" />
                </div>
            </div>
        </div>
    );
}

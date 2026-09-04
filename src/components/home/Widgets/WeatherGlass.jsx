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
        <div className="relative w-full h-full rounded-xl overflow-hidden">
            <img src="./weather2.png" alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-sky-900/30 via-transparent to-slate-900/50" />
            <div className="relative h-full flex flex-col justify-between p-3">
                <div className="flex items-start justify-between">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 px-2 py-0.5 text-[11px] font-medium text-white">
                        <MapPinIcon size={11} />
                        {data ? `${data.name}${data.sys?.country ? `, ${data.sys.country}` : ""}` : "Weather"}
                    </span>
                    <button
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={refresh}
                        title="Refresh"
                        className="rounded-full bg-white/20 backdrop-blur-md border border-white/30 p-1.5 text-white hover:bg-white/30 active:scale-95"
                    >
                        <ArrowClockwiseIcon size={12} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
                <div className="flex items-end justify-between">
                    <div>
                        <p className="text-4xl font-bold text-white drop-shadow-lg tabular-nums">
                            {temp !== null ? `${temp}°` : "--°"}
                        </p>
                        <p className="text-xs text-white/85 capitalize">
                            {data ? data.weather?.[0]?.description : (apiKey ? "Open Weather app to load" : "Missing API key")}
                        </p>
                        {data && (
                            <p className="text-[11px] text-white/70">
                                H:{Math.round(data.main.temp_max)}° L:{Math.round(data.main.temp_min)}° · 💧{data.main.humidity}%
                            </p>
                        )}
                    </div>
                    <img src={icon} alt="" className="w-14 h-14 object-contain drop-shadow-lg" />
                </div>
            </div>
        </div>
    );
}

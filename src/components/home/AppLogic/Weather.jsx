import {
    ArrowClockwiseIcon,
    CompassIcon,
    DropIcon,
    EyeIcon,
    GaugeIcon,
    MagnifyingGlassIcon,
    MapPinIcon,
    SunHorizonIcon,
    ThermometerIcon,
    WindIcon,
} from "@phosphor-icons/react";
import { useCallback, useEffect, useRef, useState } from "react";

const HISTORY_KEY = "koba-weather-history";

function compass(deg) {
    if (deg == null) return "";
    const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    return dirs[Math.round(deg / 45) % 8];
}

function formatTime(unix, timezone) {
    if (!unix) return "--";
    const d = new Date((unix + timezone) * 1000);
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "UTC" });
}

function formatDay(dt, timezone) {
    const d = new Date((dt + timezone) * 1000);
    return d.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" });
}

function formatDate(dt, timezone) {
    const d = new Date((dt + timezone) * 1000);
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });
}

export default function Weather() {
    const [city, setCity] = useState("");
    const [weather, setWeather] = useState(null);
    const [days, setDays] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [units, setUnits] = useState("metric");
    const [history, setHistory] = useState(() => {
        try {
            const raw = localStorage.getItem(HISTORY_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) return parsed.slice(0, 5);
            }
        } catch { /* noop */ }
        return [];
    });
    const [lastQuery, setLastQuery] = useState(null);
    const [updatedAt, setUpdatedAt] = useState(null);
    const didAutoRun = useRef(false);

    const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
    const unitLabel = units === "metric" ? "°C" : "°F";
    const speedLabel = units === "metric" ? "m/s" : "mph";

    const saveHistory = (name) => {
        if (!name) return;
        setHistory((prev) => {
            const next = [name, ...prev.filter((h) => h.toLowerCase() !== name.toLowerCase())].slice(0, 5);
            try { localStorage.setItem(HISTORY_KEY, JSON.stringify(next)); } catch { /* noop */ }
            return next;
        });
    };

    const fetchAll = useCallback(async (params, unitOverride) => {
        const useUnits = unitOverride || units;
        if (!apiKey) {
            setError("Missing VITE_WEATHER_API_KEY in env.");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const query = typeof params === "string" ? `q=${encodeURIComponent(params)}` : `lat=${params.lat}&lon=${params.lon}`;
            const base = "https://api.openweathermap.org/data/2.5";
            const [wRes, fRes] = await Promise.all([
                fetch(`${base}/weather?${query}&appid=${apiKey}&units=${useUnits}`),
                fetch(`${base}/forecast?${query}&appid=${apiKey}&units=${useUnits}`),
            ]);
            if (!wRes.ok) throw new Error(wRes.status === 404 ? "City not found." : "Could not fetch weather.");
            const wData = await wRes.json();
            let daily = [];
            if (fRes.ok) {
                const fData = await fRes.json();
                const byDay = new Map();
                (fData.list || []).forEach((item) => {
                    const d = new Date((item.dt + (fData.city?.timezone ?? 0)) * 1000);
                    const key = d.toLocaleDateString("en-US", { timeZone: "UTC" });
                    if (!byDay.has(key)) byDay.set(key, []);
                    byDay.get(key).push(item);
                });
                daily = Array.from(byDay.values()).slice(0, 5).map((items) => {
                    const mid = items[Math.floor(items.length / 2)] || items[0];
                    const temps = items.map((i) => i.main.temp);
                    return {
                        dt: mid.dt,
                        icon: mid.weather?.[0]?.icon,
                        desc: mid.weather?.[0]?.main,
                        min: Math.round(Math.min(...temps)),
                        max: Math.round(Math.max(...temps)),
                    };
                });
                if (daily.length > 1) daily = daily.slice(0, 5);
                setDays(daily);
                if (fData.city) wData.sys = { ...wData.sys, country: fData.city.country ?? wData.sys?.country };
            } else {
                setDays([]);
            }
            setWeather(wData);
            setLastQuery(typeof params === "string" ? params : { ...params });
            setUpdatedAt(new Date());
            if (wData.name) saveHistory(wData.name);
        } catch (err) {
            setError(err.message || "Something went wrong.");
            setWeather(null);
            setDays([]);
        } finally {
            setLoading(false);
        }
    }, [apiKey, units]);

    useEffect(() => {
        if (!didAutoRun.current && history.length > 0 && !weather && !loading && apiKey) {
            didAutoRun.current = true;
            fetchAll(history[0]);
        }
    }, [history, weather, loading, apiKey, fetchAll]);

    const onSearch = (e, override) => {
        e?.preventDefault();
        const q = (override ?? city).trim();
        if (!q) {
            setError("Enter a city name.");
            return;
        }
        fetchAll(q);
    };

    const onLocate = () => {
        if (!navigator.geolocation) {
            setError("Geolocation not supported.");
            return;
        }
        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => fetchAll({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
            () => {
                setLoading(false);
                setError("Location permission denied.");
            },
            { timeout: 8000 }
        );
    };

    const toggleUnits = () => {
        const next = units === "metric" ? "imperial" : "metric";
        setUnits(next);
        if (lastQuery) fetchAll(lastQuery, next);
    };

    const onRefresh = () => {
        if (lastQuery) fetchAll(lastQuery);
    };

    const iconUrl = weather?.weather?.[0]?.icon
        ? `https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`
        : "./weather.png";

    const details = weather ? [
        { icon: ThermometerIcon, tint: "rgba(241,226,255,0.8)", label: "Feels like", value: `${Math.round(weather.main.feels_like)}${unitLabel}` },
        { icon: DropIcon, tint: "rgba(224,242,254,0.9)", label: "Humidity", value: `${weather.main.humidity}%` },
        { icon: WindIcon, tint: "rgba(226,232,240,0.9)", label: "Wind", value: `${weather.wind.speed} ${speedLabel} ${compass(weather.wind.deg)}` },
        { icon: GaugeIcon, tint: "rgba(255,237,213,0.9)", label: "Pressure", value: `${weather.main.pressure} hPa` },
        { icon: EyeIcon, tint: "rgba(220,252,231,0.9)", label: "Visibility", value: weather.visibility ? `${(weather.visibility / 1000).toFixed(1)} km` : "--" },
        { icon: CompassIcon, tint: "rgba(243,244,246,1)", label: "Clouds", value: `${weather.clouds?.all ?? 0}%` },
    ] : [];

    return (
        <div className="w-full h-full bg-white rounded-xl overflow-y-auto">
            <div className="p-4 flex flex-col gap-4 max-w-full">
                <div className="flex items-center gap-2">
                    <form onSubmit={onSearch} className="flex items-center gap-2 flex-1 bg-white rounded-md border border-black/10 px-2 py-1.5 shadow-[0_1px_12px_rgba(0,0,0,0.05)]">
                        <MagnifyingGlassIcon size={14} className="text-neutral-400 shrink-0" />
                        <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="Search city"
                            className="w-full outline-0 text-sm text-neutral-700 placeholder:text-neutral-400 bg-transparent"
                        />
                        {city && (
                            <button type="button" onClick={() => setCity("")} className="text-xs text-neutral-400 hover:text-neutral-600 shrink-0">
                                Clear
                            </button>
                        )}
                    </form>
                    <button
                        type="button"
                        onClick={toggleUnits}
                        title={units === "metric" ? "Switch to Fahrenheit" : "Switch to Celsius"}
                        className="shrink-0 rounded-md border border-black/10 bg-white px-2 py-1.5 text-xs font-semibold text-neutral-600 shadow-[0_1px_12px_rgba(0,0,0,0.05)] hover:bg-neutral-50 active:scale-95"
                    >
                        {unitLabel}
                    </button>
                    <button
                        type="button"
                        onClick={onLocate}
                        title="Use my location"
                        className="shrink-0 rounded-md border border-black/10 bg-white p-1.5 shadow-[0_1px_12px_rgba(0,0,0,0.05)] hover:bg-neutral-50 active:scale-95"
                    >
                        <MapPinIcon size={14} className="text-neutral-500" />
                    </button>
                    <button
                        type="button"
                        onClick={onRefresh}
                        disabled={!lastQuery || loading}
                        title="Refresh"
                        className="shrink-0 rounded-md border border-black/10 bg-white p-1.5 shadow-[0_1px_12px_rgba(0,0,0,0.05)] hover:bg-neutral-50 active:scale-95 disabled:opacity-40"
                    >
                        <ArrowClockwiseIcon size={14} className={`text-neutral-500 ${loading ? "animate-spin" : ""}`} />
                    </button>
                </div>

                {history.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {history.map((h) => (
                            <button
                                key={h}
                                type="button"
                                onClick={(e) => { setCity(h); onSearch(e, h); }}
                                className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-600 hover:bg-primary/10 hover:text-primary transition active:scale-95"
                            >
                                {h}
                            </button>
                        ))}
                    </div>
                )}

                {error && (
                    <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-500">
                        {error}
                    </div>
                )}

                {loading && !weather && (
                    <div className="flex flex-col gap-2">
                        <div className="rounded-md border border-black/10 p-3 shadow-[0_1px_12px_rgba(0,0,0,0.05)]">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-md bg-neutral-100 animate-pulse shrink-0" />
                                <div className="flex-1 flex flex-col gap-1.5">
                                    <div className="h-2 w-24 rounded bg-neutral-100 animate-pulse" />
                                    <div className="h-2 w-16 rounded bg-neutral-100 animate-pulse" />
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {[0, 1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="h-14 rounded-md bg-neutral-50 border border-black/5 animate-pulse" />
                            ))}
                        </div>
                    </div>
                )}

                {!loading && !weather && !error && (
                    <div className="flex flex-col items-center gap-2 py-8">
                        <img src="./weather.png" alt="" className="w-14 h-14 object-contain opacity-80" />
                        <p className="text-sm font-semibold text-neutral-700">Check the weather</p>
                        <p className="text-xs text-neutral-400">Search a city or use your location.</p>
                    </div>
                )}

                {weather && (
                    <div className="flex flex-col gap-3">
                        <div className="rounded-md border border-black/10 bg-white p-3 shadow-[0_1px_12px_rgba(0,0,0,0.05)]">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex flex-col gap-0.5 min-w-0">
                                    <p className="text-sm font-semibold text-neutral-800 truncate">
                                        {weather.name}{weather.sys?.country ? `, ${weather.sys.country}` : ""}
                                    </p>
                                    <p className="text-xs text-neutral-400">
                                        {formatDate(weather.dt, weather.timezone ?? 0)} · {weather.weather?.[0]?.description ?? ""}
                                    </p>
                                    <p className="text-sm font-bold text-neutral-800 mt-1">
                                        {Math.round(weather.main.temp)}{unitLabel}
                                        <span className="ml-2 text-xs font-normal text-neutral-400">
                                            H:{Math.round(weather.main.temp_max)}{unitLabel} L:{Math.round(weather.main.temp_min)}{unitLabel}
                                        </span>
                                    </p>
                                </div>
                                <img src={iconUrl} alt={weather.weather?.[0]?.description || "weather"} className="w-12 h-12 object-contain shrink-0 -mt-1" />
                            </div>
                            <div className="mt-2 pt-2 border-t border-black/5 flex items-center justify-between">
                                <span className="inline-flex items-center gap-1.5 text-xs text-neutral-500">
                                    <SunHorizonIcon size={14} className="text-neutral-400" />
                                    {formatTime(weather.sys?.sunrise, weather.timezone ?? 0)}
                                </span>
                                <span className="inline-flex items-center gap-1.5 text-xs text-neutral-500">
                                    <SunHorizonIcon size={14} weight="fill" className="text-neutral-400" />
                                    {formatTime(weather.sys?.sunset, weather.timezone ?? 0)}
                                </span>
                                {updatedAt && (
                                    <span className="text-xs text-neutral-400">
                                        Updated {updatedAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            {details.map((d) => (
                                <div key={d.label} className="rounded-md border border-black/10 bg-white p-2 shadow-[0_1px_12px_rgba(0,0,0,0.04)] flex flex-col gap-1">
                                    <span className="inline-flex items-center gap-1.5">
                                        <span className="rounded-md p-1" style={{ backgroundColor: d.tint }}>
                                            <d.icon size={12} weight="duotone" className="text-neutral-600" />
                                        </span>
                                        <span className="text-xs text-neutral-400">{d.label}</span>
                                    </span>
                                    <span className="text-xs font-semibold text-neutral-700 truncate">{d.value}</span>
                                </div>
                            ))}
                        </div>

                        {days.length > 0 && (
                            <div className="rounded-md border border-black/10 bg-white p-2.5 shadow-[0_1px_12px_rgba(0,0,0,0.04)]">
                                <p className="text-xs font-semibold text-neutral-500 px-0.5 pb-2">5-day outlook</p>
                                <div className="flex gap-1.5 overflow-x-auto">
                                    {days.map((d) => (
                                        <div key={d.dt} className="flex-1 min-w-18 rounded-md bg-neutral-50 border border-black/5 px-2 py-2 flex flex-col items-center gap-1">
                                            <span className="text-xs text-neutral-500">{formatDay(d.dt, weather.timezone ?? 0)}</span>
                                            {d.icon && (
                                                <img
                                                    src={`https://openweathermap.org/img/wn/${d.icon}.png`}
                                                    alt={d.desc || ""}
                                                    className="w-8 h-8 object-contain"
                                                />
                                            )}
                                            <span className="text-xs font-semibold text-neutral-700 whitespace-nowrap">
                                                {d.max}° <span className="font-normal text-neutral-400">{d.min}°</span>
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <p className="text-xs text-neutral-300 text-center">Data by OpenWeatherMap</p>
                    </div>
                )}
            </div>
        </div>
    );
}

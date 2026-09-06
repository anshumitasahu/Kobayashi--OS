import { useEffect, useRef, useState } from "react";
import {
    BatteryChargingIcon,
    BatteryEmptyIcon,
    BatteryHighIcon,
    BatteryLowIcon,
    BatteryMediumIcon,
    CheckIcon,
    GearSixIcon,
    SunIcon,
    WifiHighIcon,
    WifiSlashIcon,
} from "@phosphor-icons/react";
import { useAppStore } from "../../store";
import { openAppByName } from "../../lib/AIChats/Capabilities";

const NETWORKS = ["KobayashiNet", "KobayashiNet 5G", "Guest"];

function batteryIcon(level, charging) {
    if (charging) return BatteryChargingIcon;
    if (level <= 0.15) return BatteryEmptyIcon;
    if (level <= 0.4) return BatteryLowIcon;
    if (level <= 0.75) return BatteryMediumIcon;
    return BatteryHighIcon;
}

export default function TopBar() {
    const openedApps = useAppStore((state) => state.openedApps);
    const Brightness = useAppStore((state) => state.Brightness);
    const setBrightness = useAppStore((state) => state.setBrightness);
    const maximized = openedApps.some((app) => app.windowState === "maximized");

    const [now, setNow] = useState(() => new Date());
    const [panel, setPanel] = useState(null);
    const [wifiOn, setWifiOn] = useState(() => (typeof navigator === "undefined" ? true : navigator.onLine));
    const [network, setNetwork] = useState(NETWORKS[0]);
    const [battery, setBattery] = useState({ level: 0.87, charging: true });
    const rootRef = useRef(null);

    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const goOnline = () => setWifiOn(true);
        const goOffline = () => setWifiOn(false);
        window.addEventListener("online", goOnline);
        window.addEventListener("offline", goOffline);
        return () => {
            window.removeEventListener("online", goOnline);
            window.removeEventListener("offline", goOffline);
        };
    }, []);

    useEffect(() => {
        let manager = null;
        let onLevel = null;
        let onCharging = null;
        const sync = () => {
            if (!manager) return;
            setBattery({ level: manager.level ?? 1, charging: manager.charging });
        };
        if (navigator?.getBattery) {
            navigator.getBattery().then((m) => {
                manager = m;
                sync();
                onLevel = () => sync();
                onCharging = () => sync();
                manager.addEventListener("levelchange", onLevel);
                manager.addEventListener("chargingchange", onCharging);
            }).catch(() => {});
        }
        return () => {
            manager?.removeEventListener("levelchange", onLevel);
            manager?.removeEventListener("chargingchange", onCharging);
        };
    }, []);

    useEffect(() => {
        if (!panel) return;
        const dismiss = (e) => {
            if (e.target?.closest?.("[data-topbar-panel]")) return;
            if (e.target?.closest?.("[data-topbar-toggle]")) return;
            setPanel(null);
        };
        const onKey = (e) => {
            if (e.key === "Escape") setPanel(null);
        };
        window.addEventListener("pointerdown", dismiss);
        window.addEventListener("keydown", onKey);
        return () => {
            window.removeEventListener("pointerdown", dismiss);
            window.removeEventListener("keydown", onKey);
        };
    }, [panel ]);

    if (maximized) return null;

    const toggle = (name) => setPanel((current) => (current === name ? null : name));

    const visible = openedApps.filter((app) => app.windowState !== "minimized");
    const frontApp = visible.length ? visible.reduce((top, app) => (app.zIndex > top.zIndex ? app : top)) : null;

    const time = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    const date = now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

    const brightnessValue = Math.min(100, Math.max(0, Number(Brightness) || 100));
    const BatteryIcon = batteryIcon(battery.level, battery.charging);
    const batteryPct = Math.round(battery.level * 100);

    const year = now.getFullYear();
    const month = now.getMonth();
    const monthLabel = now.toLocaleString("en-US", { month: "long" });
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

    const iconBtn = "rounded-md p-1.5 text-neutral-700 transition-colors hover:bg-black/[0.06] cursor-pointer";
    const panelCard = "absolute top-[30px] z-[950] overflow-hidden rounded-2xl border border-white/60 bg-white/75 text-neutral-800 shadow-[0_16px_48px_rgba(0,0,0,0.18)] backdrop-blur-2xl";

    return (
        <div ref={rootRef} className="relative z-[900]">
            <div className="flex h-9 w-full items-center justify-between border-b border-white/50 bg-white/55 px-4 text-[13px] text-neutral-800 backdrop-blur-2xl select-none">
                <div className="relative flex min-w-0 items-center gap-2">
                    <button
                        data-topbar-toggle="logo"
                        onClick={() => toggle("logo")}
                        title="Kobayashi OS"
                        className={`${iconBtn} -ml-1.5`}
                    >
                        <img src="/logo.svg" alt="Kobayashi OS" className="h-4 w-4" draggable={false} />
                    </button>
                    <span className="truncate font-semibold tracking-tight">Kobayashi OS</span>
                    {frontApp && (
                        <span className="hidden truncate text-neutral-500 sm:inline">— {frontApp.name}</span>
                    )}
                    {panel === "logo" && (
                        <div data-topbar-panel className={`${panelCard} left-0 w-56 p-1.5`}>
                            <button
                                onClick={() => { setPanel(null); openAppByName("About"); }}
                                className="w-full cursor-pointer rounded-lg px-3 py-1.5 text-left hover:bg-black/[0.05]"
                            >
                                About Kobayashi OS
                            </button>
                            <div className="mx-2 my-1 h-px bg-neutral-900/10" />
                            <button
                                onClick={() => { setPanel(null); openAppByName("Settings"); }}
                                className="w-full cursor-pointer rounded-lg px-3 py-1.5 text-left hover:bg-black/[0.05]"
                            >
                                Settings…
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-0.5">
                    <div className="relative">
                        <button data-topbar-toggle="brightness" onClick={() => toggle("brightness")} title="Display brightness" className={iconBtn}>
                            <SunIcon size={16} />
                        </button>
                        {panel === "brightness" && (
                            <div data-topbar-panel className={`${panelCard} right-0 w-60 p-4`}>
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">Brightness</span>
                                    <span className="text-neutral-500 tabular-nums">{brightnessValue}%</span>
                                </div>
                                <div className="mt-3 flex items-center gap-2.5">
                                    <SunIcon size={15} className="shrink-0 text-neutral-400" />
                                    <input
                                        type="range"
                                        min={30}
                                        max={100}
                                        value={brightnessValue}
                                        onChange={(e) => setBrightness(Number(e.target.value))}
                                        className="w-full accent-neutral-800"
                                    />
                                    <SunIcon size={18} className="shrink-0 text-neutral-700" />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <button data-topbar-toggle="wifi" onClick={() => toggle("wifi")} title={wifiOn ? `Connected to ${network}` : "Wi-Fi off"} className={iconBtn}>
                            {wifiOn ? <WifiHighIcon size={16} /> : <WifiSlashIcon size={16} className="text-neutral-400" />}
                        </button>
                        {panel === "wifi" && (
                            <div data-topbar-panel className={`${panelCard} right-0 w-60 p-4`}>
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">Wi-Fi</span>
                                    <button
                                        onClick={() => setWifiOn((v) => !v)}
                                        role="switch"
                                        aria-checked={wifiOn}
                                        className={`relative h-6 w-11 cursor-pointer rounded-full transition-colors ${wifiOn ? "bg-neutral-800" : "bg-neutral-300"}`}
                                    >
                                        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${wifiOn ? "left-[22px]" : "left-0.5"}`} />
                                    </button>
                                </div>
                                {wifiOn ? (
                                    <div className="mt-2">
                                        {NETWORKS.map((name) => (
                                            <button
                                                key={name}
                                                onClick={() => setNetwork(name)}
                                                className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-black/[0.05]"
                                            >
                                                <WifiHighIcon size={15} className="shrink-0 text-neutral-500" />
                                                <span className="flex-1 truncate">{name}</span>
                                                {network === name && <CheckIcon size={14} weight="bold" />}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="mt-2 px-1 text-neutral-500">Wi-Fi is off</p>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <button data-topbar-toggle="battery" onClick={() => toggle("battery")} title={`${batteryPct}%${battery.charging ? " — charging" : ""}`} className={iconBtn}>
                            <BatteryIcon size={17} />
                        </button>
                        {panel === "battery" && (
                            <div data-topbar-panel className={`${panelCard} right-0 w-56 p-4`}>
                                <div className="flex items-center gap-2.5">
                                    <BatteryIcon size={22} />
                                    <div>
                                        <p className="font-medium tabular-nums">{batteryPct}%</p>
                                        <p className="text-xs text-neutral-500">{battery.charging ? "Charging" : "On battery"}</p>
                                    </div>
                                </div>
                                <p className="mt-2 text-xs text-neutral-500">Power source: Battery</p>
                            </div>
                        )}
                    </div>

                    <button onClick={() => openAppByName("Settings")} title="Settings" className={iconBtn}>
                        <GearSixIcon size={16} />
                    </button>

                    <div className="mx-1.5 h-4 w-px bg-neutral-900/10" />

                    <div className="relative">
                        <button
                            data-topbar-toggle="calendar"
                            onClick={() => toggle("calendar")}
                            className="cursor-pointer rounded-md px-2 py-1 font-medium tabular-nums transition-colors hover:bg-black/[0.06]"
                        >
                            {date} <span className="text-neutral-500">{time}</span>
                        </button>
                        {panel === "calendar" && (
                            <div data-topbar-panel className={`${panelCard} right-0 w-64 p-4`}>
                                <p className="font-semibold tracking-tight">
                                    {monthLabel} <span className="font-normal text-neutral-400">{year}</span>
                                </p>
                                <div className="mt-2 grid grid-cols-7 gap-0.5 text-center text-[11px] font-medium text-neutral-400">
                                    {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                                        <span key={i} className="py-0.5">{d}</span>
                                    ))}
                                    {cells.map((day, i) =>
                                        day === null ? (
                                            <span key={i} />
                                        ) : (
                                            <span
                                                key={i}
                                                className={`flex aspect-square items-center justify-center rounded-full tabular-nums ${
                                                    day === now.getDate()
                                                        ? "bg-[#ff3b30] font-semibold text-white"
                                                        : ""
                                                }`}
                                            >
                                                {day}
                                            </span>
                                        )
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

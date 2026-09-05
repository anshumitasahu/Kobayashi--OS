import { useEffect, useMemo, useRef, useState } from "react";
import {
    ArrowClockwiseIcon,
    ArrowLeftIcon,
    ArrowRightIcon,
    GlobeIcon,
    HouseIcon,
    LockIcon,
    MagnifyingGlassIcon,
    PlusIcon,
    GearSixIcon,
    XIcon,
} from "@phosphor-icons/react";
import { useAppStore } from "../../../store";
import { getWallpaper } from "../../../DB/wallpaperDB";

const ENGINES = {
    google: { label: "Google", search: (q) => `https://www.google.com/search?igu=1&q=${encodeURIComponent(q)}` },
    duckduckgo: { label: "DuckDuckGo", search: (q) => `https://duckduckgo.com/?q=${encodeURIComponent(q)}` },
    bing: { label: "Bing", search: (q) => `https://www.bing.com/search?q=${encodeURIComponent(q)}` },
    brave: { label: "Brave", search: (q) => `https://search.brave.com/search?q=${encodeURIComponent(q)}` },
};

const KOBASURF_HOME = "kobasurf://home";
const LEGACY_DEFAULT = "https://www.google.com/search?igu=1";
const DEFAULT_HOMEPAGE = KOBASURF_HOME;
const SETTINGS_KEY = "kobayashi-browser-settings";

const isKobasurfUrl = (url) => typeof url === "string" && url.startsWith("kobasurf://");

function loadSettings() {
    try {
        const raw = localStorage.getItem(SETTINGS_KEY);
        if (!raw) return { engine: "google", homepage: DEFAULT_HOMEPAGE };
        const parsed = JSON.parse(raw);
        let homepage = typeof parsed.homepage === "string" && parsed.homepage.trim() ? parsed.homepage.trim() : DEFAULT_HOMEPAGE;
        if (homepage === LEGACY_DEFAULT) homepage = DEFAULT_HOMEPAGE;
        return {
            engine: ENGINES[parsed.engine] ? parsed.engine : "google",
            homepage,
        };
    } catch {
        return { engine: "google", homepage: DEFAULT_HOMEPAGE };
    }
}

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

function looksLikeUrl(input) {
    if (/^https?:\/\//i.test(input)) return true;
    if (input.startsWith("localhost") || /^\d+\.\d+\.\d+\.\d+/.test(input)) return true;
    return /^[^\s]+\.[^\s]{2,}(\/\S*)?$/.test(input);
}

function resolveInput(input, engine, homepage) {
    const text = input.trim();
    if (!text) return null;
    if (text.toLowerCase() === "home") return homepage;
    if (looksLikeUrl(text)) {
        return /^https?:\/\//i.test(text) ? text : `https://${text}`;
    }
    return ENGINES[engine].search(text);
}

function shortTitle(url) {
    if (isKobasurfUrl(url)) return "Kobasurf";
    try {
        const u = new URL(url);
        if (ENGINES.google.search("").startsWith(u.origin + u.pathname) || u.hostname.includes("google.com")) {
            const q = u.searchParams.get("q");
            return q ? `Search · ${q.slice(0, 24)}` : "New Tab";
        }
        return u.hostname.replace(/^www\./, "") + (u.pathname !== "/" ? u.pathname.slice(0, 18) : "");
    } catch {
        return url.slice(0, 24) || "New Tab";
    }
}

function useWallpaper() {
    const wallpaper = useAppStore((s) => s.Wallpaper);
    const [customSrc, setCustomSrc] = useState(null);
    const [customKind, setCustomKind] = useState(null);
    const isCustom = (wallpaper || "").startsWith("idb://");

    useEffect(() => {
        if (!isCustom) {
            setCustomSrc(null);
            setCustomKind(null);
            return;
        }
        let cancelled = false;
        let url = null;
        const id = (wallpaper || "").slice("idb://".length);
        getWallpaper(id)
            .then((row) => {
                if (cancelled || !row?.blob) return;
                url = URL.createObjectURL(row.blob);
                setCustomSrc(url);
                setCustomKind(row.kind || (row.mime?.startsWith("video/") ? "video" : "image"));
            })
            .catch(() => { });
        return () => {
            cancelled = true;
            if (url) URL.revokeObjectURL(url);
            setCustomSrc(null);
            setCustomKind(null);
        };
    }, [wallpaper, isCustom]);

    const src = isCustom ? customSrc : wallpaper;
    const isVideo = isCustom
        ? customKind === "video"
        : /\.(mp4|webm|mov|m4v|ogv|ogg)(\?.*)?$/i.test(wallpaper || "");
    return { src, isVideo };
}

function KobasurfHome({ engineLabel, onSearch }) {
    const [q, setQ] = useState("");
    const { src, isVideo } = useWallpaper();

    return (
        <div className="relative h-full w-full overflow-hidden bg-neutral-100">
            {src && (
                isVideo ? (
                    <video key={src} src={src} autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover" />
                ) : (
                    <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" />
                )
            )}
            <div className="absolute inset-0 bg-black/30 backdrop-blur-[3px]" />
            <div className="relative flex h-full w-full flex-col items-center justify-center px-6">
                <div className="flex items-center gap-6">
                    <img src="/logo.svg" alt="Kobasurf" className="h-16 w-16" />
                    <h1 className="mt-4 text-[26px] font-semibold lowercase tracking-tight text-white">
                        kobasurf
                    </h1>
                </div>
                <form
                    onSubmit={(e) => { e.preventDefault(); if (q.trim()) onSearch(q.trim()); }}
                    className="mt-6 flex h-11 w-full max-w-[440px] items-center gap-2 rounded-full bg-white px-4 shadow-md transition-shadow focus-within:shadow-lg"
                >
                    <MagnifyingGlassIcon size={15} className="shrink-0 text-neutral-400" />
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder={`Search with ${engineLabel} or enter address`}
                        spellCheck={false}
                        className="min-w-0 flex-1 bg-transparent text-[13px] text-neutral-800 outline-none placeholder:text-neutral-400"
                    />
                    {q && (
                        <button type="button" aria-label="Clear search" onClick={() => setQ("")} className="text-neutral-400 hover:text-neutral-600">
                            <XIcon size={12} />
                        </button>
                    )}
                </form>
            </div>
        </div>
    );
}

function IconBtn({ label, disabled, onClick, children }) {
    return (
        <button
            type="button"
            title={label}
            aria-label={label}
            disabled={disabled}
            onClick={onClick}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 disabled:pointer-events-none disabled:opacity-30"
        >
            {children}
        </button>
    );
}

export default function Browser({ searchQuery = "" }) {
    const [settings, setSettings] = useState(loadSettings);
    const [tabs, setTabs] = useState(() => [{ id: uid(), history: [settings.homepage], index: 0 }]);
    const [activeId, setActiveId] = useState(() => null);
    const [draft, setDraft] = useState(settings.homepage);
    const [focused, setFocused] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);
    const [homeDraft, setHomeDraft] = useState(settings.homepage);
    const inputRef = useRef(null);

    const active = tabs.find((t) => t.id === (activeId ?? tabs[0]?.id)) ?? tabs[0];
    const currentUrl = active ? active.history[active.index] : settings.homepage;
    const canBack = active ? active.index > 0 : false;
    const canForward = active ? active.index < active.history.length - 1 : false;
    const secure = currentUrl.startsWith("https://");

    useEffect(() => {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    }, [settings]);

    useEffect(() => {
        if (!focused) setDraft(currentUrl);
    }, [currentUrl, focused]);

    useEffect(() => {
        const q = searchQuery.trim();
        if (!q) return;
        const url = ENGINES[settings.engine].search(q);
        navigate(url);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery]);

    function navigate(url, tabId = active?.id) {
        if (!url || !tabId) return;
        setTabs((prev) =>
            prev.map((t) => {
                if (t.id !== tabId) return t;
                const next = t.history.slice(0, t.index + 1);
                if (next[next.length - 1] !== url) next.push(url);
                return { ...t, history: next, index: next.length - 1 };
            })
        );
        setActiveId(tabId);
        setDraft(url);
        setFocused(false);
    }

    function go(delta) {
        if (!active) return;
        const next = active.index + delta;
        if (next < 0 || next >= active.history.length) return;
        setTabs((prev) => prev.map((t) => (t.id === active.id ? { ...t, index: next } : t)));
    }

    function newTab() {
        const tab = { id: uid(), history: [settings.homepage], index: 0 };
        setTabs((prev) => [...prev, tab]);
        setActiveId(tab.id);
        setDraft(settings.homepage);
    }

    function closeTab(id) {
        setTabs((prev) => {
            if (prev.length === 1) return [{ id: uid(), history: [settings.homepage], index: 0 }];
            const at = prev.findIndex((t) => t.id === id);
            const next = prev.filter((t) => t.id !== id);
            if (id === (activeId ?? active?.id)) {
                const fallback = next[Math.max(0, at - 1)] ?? next[0];
                setActiveId(fallback.id);
            }
            return next;
        });
    }

    function submit() {
        const url = resolveInput(draft, settings.engine, settings.homepage);
        if (url) navigate(url);
        else setDraft(currentUrl);
        inputRef.current?.blur();
    }

    const visibleTabs = useMemo(() => tabs, [tabs]);

    return (
        <div className="flex h-full w-full flex-col overflow-hidden bg-white text-[13px] text-neutral-800">
            <div className="flex items-end gap-1 border-b border-neutral-200 bg-neutral-50 px-2 pt-1.5">
                <div className="flex min-w-0 flex-1 items-end gap-1 overflow-x-auto">
                    {visibleTabs.map((t) => {
                        const isActive = t.id === active?.id;
                        const url = t.history[t.index];
                        return (
                            <div
                                key={t.id}
                                onClick={() => { setActiveId(t.id); setDraft(url); }}
                                className={`group flex h-8 max-w-[168px] min-w-[96px] cursor-default items-center gap-1.5 rounded-t-md border px-2.5 text-xs transition-colors ${isActive
                                        ? "border-neutral-200 border-b-white bg-white text-neutral-900"
                                        : "border-transparent text-neutral-500 hover:bg-neutral-200/60 hover:text-neutral-700"
                                    }`}
                            >
                                <GlobeIcon size={12} className="shrink-0 opacity-60" />
                                <span className="min-w-0 flex-1 truncate">{shortTitle(url)}</span>
                                <button
                                    type="button"
                                    aria-label="Close tab"
                                    onClick={(e) => { e.stopPropagation(); closeTab(t.id); }}
                                    className="hidden h-4 w-4 shrink-0 items-center justify-center rounded-full hover:bg-neutral-200 group-hover:flex"
                                >
                                    <XIcon size={10} />
                                </button>
                            </div>
                        );
                    })}
                </div>
                <button
                    type="button"
                    title="New tab"
                    aria-label="New tab"
                    onClick={newTab}
                    className="mb-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-200/70 hover:text-neutral-800"
                >
                    <PlusIcon size={14} />
                </button>
            </div>

            <div className="flex items-center gap-0.5 border-b border-neutral-200 bg-white px-2 py-1.5">
                <IconBtn label="Back" disabled={!canBack} onClick={() => go(-1)}>
                    <ArrowLeftIcon size={16} />
                </IconBtn>
                <IconBtn label="Forward" disabled={!canForward} onClick={() => go(1)}>
                    <ArrowRightIcon size={16} />
                </IconBtn>
                <IconBtn label="Reload" onClick={() => setReloadKey((k) => k + 1)}>
                    <ArrowClockwiseIcon size={15} />
                </IconBtn>
                <IconBtn label="Home" onClick={() => navigate(settings.homepage)}>
                    <HouseIcon size={15} />
                </IconBtn>
                <div className="mx-1 flex h-8 min-w-0 flex-1 items-center gap-2 rounded-full bg-neutral-100 px-3 transition-colors focus-within:bg-white focus-within:ring-1 focus-within:ring-neutral-300 hover:bg-neutral-200/60 focus-within:hover:bg-white">
                    {secure ? (
                        <LockIcon size={12} className="shrink-0 text-neutral-400" />
                    ) : (
                        <GlobeIcon size={13} className="shrink-0 text-neutral-400" />
                    )}
                    <input
                        ref={inputRef}
                        value={focused ? draft : isKobasurfUrl(currentUrl) ? "" : currentUrl}
                        onChange={(e) => setDraft(e.target.value)}
                        onFocus={() => { setDraft(isKobasurfUrl(currentUrl) ? "" : currentUrl); setFocused(true); setTimeout(() => inputRef.current?.select(), 0); }}
                        onBlur={() => setFocused(false)}
                        onKeyDown={(e) => { if (e.key === "Enter") submit(); if (e.key === "Escape") { setDraft(currentUrl); inputRef.current?.blur(); } }}
                        placeholder="Search or type a URL"
                        spellCheck={false}
                        className="min-w-0 flex-1 bg-transparent text-[13px] text-neutral-800 outline-none placeholder:text-neutral-400"
                    />
                    {draft.trim() && focused && (
                        <button type="button" aria-label="Clear" onClick={() => setDraft("")} className="text-neutral-400 hover:text-neutral-600">
                            <XIcon size={12} />
                        </button>
                    )}
                </div>
                <div className="relative shrink-0">
                    <IconBtn label="Browser settings" onClick={() => { setHomeDraft(settings.homepage); setSettingsOpen((v) => !v); }}>
                        <GearSixIcon size={16} />
                    </IconBtn>
                    {settingsOpen && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setSettingsOpen(false)} />
                            <div className="absolute right-0 z-20 mt-1 w-60 rounded-lg border border-neutral-200 bg-white p-3 shadow-lg">
                                <p className="mb-2 text-xs font-medium text-neutral-900">Settings</p>
                                <label className="mb-1 block text-[11px] text-neutral-500">Search engine</label>
                                <div className="relative mb-3">
                                    <select
                                        value={settings.engine}
                                        onChange={(e) => setSettings((s) => ({ ...s, engine: e.target.value }))}
                                        className="w-full appearance-none rounded-md border border-neutral-200 bg-white py-1.5 pl-2.5 pr-8 text-xs outline-none focus:border-neutral-400"
                                    >
                                        {Object.entries(ENGINES).map(([key, e]) => (
                                            <option key={key} value={key}>{e.label}</option>
                                        ))}
                                    </select>
                                    <MagnifyingGlassIcon size={12} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                                </div>
                                <label className="mb-1 block text-[11px] text-neutral-500">Homepage</label>
                                <input
                                    value={homeDraft}
                                    onChange={(e) => setHomeDraft(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            const v = homeDraft.trim() ? (looksLikeUrl(homeDraft.trim()) ? (/^https?:\/\//i.test(homeDraft.trim()) ? homeDraft.trim() : `https://${homeDraft.trim()}`) : homeDraft.trim()) : DEFAULT_HOMEPAGE;
                                            setSettings((s) => ({ ...s, homepage: v }));
                                            setSettingsOpen(false);
                                        }
                                    }}
                                    placeholder="https://…"
                                    spellCheck={false}
                                    className="w-full rounded-md border border-neutral-200 px-2.5 py-1.5 text-xs outline-none focus:border-neutral-400"
                                />
                                <div className="mt-3 flex justify-end gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => { setSettings({ engine: "google", homepage: DEFAULT_HOMEPAGE }); setHomeDraft(DEFAULT_HOMEPAGE); }}
                                        className="rounded-md px-2.5 py-1.5 text-xs text-neutral-500 hover:bg-neutral-100"
                                    >
                                        Reset
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const v = homeDraft.trim() || DEFAULT_HOMEPAGE;
                                            setSettings((s) => ({ ...s, homepage: /^https?:\/\//i.test(v) || !looksLikeUrl(v) ? v : `https://${v}` }));
                                            setSettingsOpen(false);
                                        }}
                                        className="rounded-md bg-neutral-900 px-2.5 py-1.5 text-xs text-white hover:bg-neutral-700"
                                    >
                                        Done
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="min-h-0 flex-1 bg-white">
                {isKobasurfUrl(currentUrl) ? (
                    <KobasurfHome
                        key={active?.id}
                        engineLabel={ENGINES[settings.engine].label}
                        onSearch={(raw) => {
                            const url = resolveInput(raw, settings.engine, settings.homepage);
                            if (url) navigate(url);
                        }}
                    />
                ) : (
                    <iframe
                        key={`${active?.id}-${active?.index}-${reloadKey}`}
                        src={currentUrl}
                        title="Browser"
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                        className="h-full w-full border-0 bg-white"
                    />
                )}
            </div>
        </div>
    );
}

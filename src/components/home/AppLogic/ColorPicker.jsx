import {
    ArrowCounterClockwiseIcon,
    CheckIcon,
    CopyIcon,
    EyedropperIcon,
    HeartIcon,
    ShuffleIcon,
    SwatchesIcon,
    TrashIcon,
} from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { ColorPicker, ColorService, useColor } from "react-color-palette";
import "react-color-palette/css";

const HISTORY_KEY = "koba-color-history";
const FAVORITES_KEY = "koba-color-favorites";

const HARMONIES = ["Complementary", "Analogous", "Triadic"];

function readList(key) {
    try {
        const raw = localStorage.getItem(key);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed.filter((c) => /^#[0-9a-f]{6}$/i.test(c)) : [];
    } catch {
        return [];
    }
}

function hexToRgb(hex) {
    const n = hex.replace("#", "");
    return {
        r: parseInt(n.slice(0, 2), 16),
        g: parseInt(n.slice(2, 4), 16),
        b: parseInt(n.slice(4, 6), 16),
    };
}

function rgbToHex(r, g, b) {
    const to = (v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, "0");
    return `#${to(r)}${to(g)}${to(b)}`;
}

function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const l = (max + min) / 2;
    if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) };
    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    let h;
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0));
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    return { h: Math.round(h * 60), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToHex(h, s, l) {
    s /= 100; l /= 100;
    const k = (n) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return rgbToHex(f(0) * 255, f(8) * 255, f(4) * 255);
}

function luminance(hex) {
    const { r, g, b } = hexToRgb(hex);
    const f = (v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function contrastRatio(a, b) {
    const l1 = luminance(a), l2 = luminance(b);
    const hi = Math.max(l1, l2), lo = Math.min(l1, l2);
    return (hi + 0.05) / (lo + 0.05);
}

function mix(hex, target, amount) {
    const c = hexToRgb(hex), t = hexToRgb(target);
    return rgbToHex(
        c.r + (t.r - c.r) * amount,
        c.g + (t.g - c.g) * amount,
        c.b + (t.b - c.b) * amount
    );
}

function shadesOf(hex) {
    return [
        mix(hex, "#000000", 0.6),
        mix(hex, "#000000", 0.35),
        mix(hex, "#000000", 0.15),
        hex,
        mix(hex, "#ffffff", 0.3),
        mix(hex, "#ffffff", 0.6),
        mix(hex, "#ffffff", 0.82),
    ];
}

function harmonyOf(hex, mode) {
    const { r, g, b } = hexToRgb(hex);
    const { h, s, l } = rgbToHsl(r, g, b);
    const spin = (deg) => hslToHex((h + deg + 360) % 360, s, l);
    if (mode === "Complementary") return [hex, spin(180)];
    if (mode === "Triadic") return [hex, spin(120), spin(240)];
    return [spin(-30), hex, spin(30)];
}

function wcagLabel(ratio) {
    if (ratio >= 7) return "AAA";
    if (ratio >= 4.5) return "AA";
    if (ratio >= 3) return "AA Large";
    return "Fail";
}

function IconButton({ title, onClick, label, children, tone = "ghost" }) {
    const tones = {
        ghost: "border border-black/5 bg-white text-neutral-500 hover:text-neutral-900 hover:border-black/10",
        tint: "bg-black/10 hover:bg-black/15",
    };
    return (
        <button
            type="button"
            title={title}
            aria-label={label ?? title}
            onClick={onClick}
            className={`rounded-full p-2.5 transition active:scale-90 ${tones[tone]}`}
        >
            {children}
        </button>
    );
}

function Section({ title, action, children }) {
    return (
        <section className="rounded-3xl border border-black/5 bg-white p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-neutral-800">{title}</h2>
                {action}
            </div>
            {children}
        </section>
    );
}

export default function MyColorPicker() {
    const [color, setColor] = useColor("#a866ff");
    const [copiedKey, setCopiedKey] = useState(null);
    const [harmony, setHarmony] = useState(HARMONIES[0]);
    const [history, setHistory] = useState(() => readList(HISTORY_KEY));
    const [favorites, setFavorites] = useState(() => readList(FAVORITES_KEY));
    const [eyeError, setEyeError] = useState("");
    const copyTimer = useRef(null);
    const historyTimer = useRef(null);

    const hex = color.hex.toLowerCase();
    const { r, g, b } = hexToRgb(hex);
    const { h, s, l } = rgbToHsl(r, g, b);
    const rgbStr = `rgb(${r}, ${g}, ${b})`;
    const hslStr = `hsl(${h}, ${s}%, ${l}%)`;

    const formats = [
        { key: "hex", label: "HEX", value: hex.toUpperCase() },
        { key: "rgb", label: "RGB", value: rgbStr },
        { key: "hsl", label: "HSL", value: hslStr },
    ];

    useEffect(() => {
        return () => {
            clearTimeout(copyTimer.current);
            clearTimeout(historyTimer.current);
        };
    }, []);

    useEffect(() => {
        clearTimeout(historyTimer.current);
        historyTimer.current = setTimeout(() => {
            setHistory((prev) => {
                if (prev[0] === hex) return prev;
                const next = [hex, ...prev.filter((c) => c !== hex)].slice(0, 12);
                try { localStorage.setItem(HISTORY_KEY, JSON.stringify(next)); } catch { /* noop */ }
                return next;
            });
        }, 900);
    }, [hex]);

    const copyText = async (key, text) => {
        try {
            await navigator.clipboard.writeText(text);
        } catch {
            const ta = document.createElement("textarea");
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            ta.remove();
        }
        setCopiedKey(key);
        clearTimeout(copyTimer.current);
        copyTimer.current = setTimeout(() => setCopiedKey(null), 1600);
    };

    const randomize = () => {
        const rand = rgbToHex(
            Math.floor(Math.random() * 256),
            Math.floor(Math.random() * 256),
            Math.floor(Math.random() * 256)
        );
        setColor(toColor(rand));
    };

    const pickFromScreen = async () => {
        setEyeError("");
        if (!("EyeDropper" in window)) {
            setEyeError("Screen picker is not supported in this browser.");
            return;
        }
        try {
            const result = await new window.EyeDropper().open();
            if (result?.sRGBHex) setColor(toColor(result.sRGBHex));
        } catch { /* user cancelled */ }
    };

    const toggleFavorite = () => {
        setFavorites((prev) => {
            const next = prev.includes(hex) ? prev.filter((c) => c !== hex) : [hex, ...prev].slice(0, 24);
            try { localStorage.setItem(FAVORITES_KEY, JSON.stringify(next)); } catch { /* noop */ }
            return next;
        });
    };

    const clearHistory = () => {
        setHistory([]);
        try { localStorage.removeItem(HISTORY_KEY); } catch { /* noop */ }
    };

    const isFav = favorites.includes(hex);
    const isLight = luminance(hex) > 0.4;
    const onPreview = isLight ? "#1c1917" : "#ffffff";
    const whiteRatio = contrastRatio(hex, "#ffffff");
    const blackRatio = contrastRatio(hex, "#000000");
    const bestText = whiteRatio >= blackRatio ? "#ffffff" : "#000000";
    const bestRatio = Math.max(whiteRatio, blackRatio);
    const shades = shadesOf(hex);
    const harmonyColors = harmonyOf(hex, harmony);

    return (
        <div className="h-full w-full overflow-y-auto overflow-x-hidden bg-neutral-50 text-neutral-800">
            <div className="mx-auto flex w-full max-w-xl flex-col gap-6 px-6 py-8 sm:gap-8 sm:px-8 sm:py-10">
                <header className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <h1 className="text-xl font-semibold tracking-tight text-neutral-900">Colour</h1>
                        <p className="mt-1 text-sm text-neutral-400">Pick, compare and save colours</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                        <IconButton title="Random colour" onClick={randomize}>
                            <ShuffleIcon size={17} />
                        </IconButton>
                        <IconButton title="Pick from screen" onClick={pickFromScreen}>
                            <EyedropperIcon size={17} />
                        </IconButton>
                    </div>
                </header>

                <section
                    className="overflow-hidden rounded-3xl transition-colors duration-200"
                    style={{ backgroundColor: hex }}
                >
                    <div
                        className="flex min-h-48 flex-col justify-between gap-8 p-6 sm:p-8"
                        style={{ color: onPreview }}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                                <button
                                    type="button"
                                    onClick={() => copyText("preview", hex.toUpperCase())}
                                    title="Copy HEX"
                                    className="block truncate text-left text-3xl font-semibold tracking-tight transition hover:opacity-80 active:scale-[0.98] sm:text-4xl"
                                >
                                    {copiedKey === "preview" ? "Copied!" : hex.toUpperCase()}
                                </button>
                                <p className="mt-2 truncate text-sm opacity-70">
                                    {rgbStr} · {hslStr}
                                </p>
                            </div>
                            <IconButton
                                tone="tint"
                                title={isFav ? "Remove from favourites" : "Save to favourites"}
                                label="Toggle favourite"
                                onClick={toggleFavorite}
                            >
                                <span style={{ color: onPreview }} className="block">
                                    <HeartIcon size={17} weight={isFav ? "fill" : "regular"} />
                                </span>
                            </IconButton>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm opacity-75">
                            <span>
                                Best text:{" "}
                                <span className="font-semibold">
                                    {bestText === "#ffffff" ? "White" : "Black"}
                                </span>
                            </span>
                            <span>{bestRatio.toFixed(2)}:1 contrast</span>
                        </div>
                    </div>
                </section>

                {eyeError && (
                    <p className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-500">
                        {eyeError}
                    </p>
                )}

                <div className="overflow-hidden rounded-3xl border border-black/5 bg-white p-4 sm:p-5 [&_.rcp]:!border-0 [&_.rcp]:!shadow-none">
                    <ColorPicker color={color} onChange={setColor} hideAlpha hideInput height={180} />
                </div>

                <div className="flex flex-col gap-3">
                    {formats.map((f) => (
                        <div
                            key={f.key}
                            className="flex items-center gap-4 rounded-2xl border border-black/5 bg-white px-4 py-3.5"
                        >
                            <span className="w-10 shrink-0 text-xs font-bold tracking-wide text-neutral-400">
                                {f.label}
                            </span>
                            <span className="min-w-0 flex-1 truncate font-mono text-sm text-neutral-700">
                                {f.value}
                            </span>
                            <button
                                type="button"
                                onClick={() => copyText(f.key, f.value)}
                                title={`Copy ${f.label}`}
                                className="shrink-0 rounded-full p-2 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-800 active:scale-90"
                            >
                                {copiedKey === f.key
                                    ? <CheckIcon size={16} className="text-green-500" />
                                    : <CopyIcon size={16} />}
                            </button>
                        </div>
                    ))}
                </div>

                <Section title="Shades & tints">
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(2.5rem,1fr))] gap-2.5">
                        {shades.map((shade) => (
                            <button
                                key={shade}
                                type="button"
                                onClick={() => setColor(toColor(shade))}
                                title={shade.toUpperCase()}
                                className={`h-12 rounded-2xl border transition active:scale-95 ${shade === hex ? "border-neutral-900 ring-2 ring-neutral-900/20" : "border-black/5 hover:scale-105"}`}
                                style={{ backgroundColor: shade }}
                            />
                        ))}
                    </div>
                </Section>

                <Section
                    title="Harmony"
                    action={
                        <div className="flex shrink-0 gap-1">
                            {HARMONIES.map((mode) => (
                                <button
                                    key={mode}
                                    type="button"
                                    onClick={() => setHarmony(mode)}
                                    className={`rounded-full px-3 py-1 text-xs transition active:scale-95 ${harmony === mode ? "bg-neutral-900 font-semibold text-white" : "text-neutral-400 hover:text-neutral-700"}`}
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>
                    }
                >
                    <div className="flex flex-col gap-2.5">
                        <div className="grid grid-cols-[repeat(auto-fit,minmax(4rem,1fr))] gap-2.5">
                            {harmonyColors.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setColor(toColor(c))}
                                    title={c.toUpperCase()}
                                    className="overflow-hidden rounded-2xl border border-black/5 transition hover:scale-[1.02] active:scale-95"
                                >
                                    <span className="block h-12" style={{ backgroundColor: c }} />
                                    <span className="block bg-neutral-50 py-1.5 font-mono text-xs uppercase text-neutral-500">
                                        {c}
                                    </span>
                                </button>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={() => copyText("palette", harmonyColors.map((c) => c.toUpperCase()).join(", "))}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl py-2 text-xs font-medium text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 active:scale-[0.99]"
                        >
                            {copiedKey === "palette" ? <CheckIcon size={14} className="text-green-500" /> : <CopyIcon size={14} />}
                            {copiedKey === "palette" ? "Palette copied" : "Copy palette"}
                        </button>
                    </div>
                </Section>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    {[
                        { label: "On white", ratio: whiteRatio },
                        { label: "On black", ratio: blackRatio },
                    ].map(({ label, ratio }) => (
                        <div key={label} className="rounded-3xl border border-black/5 bg-white p-5">
                            <p className="text-xs text-neutral-400">{label}</p>
                            <p className="mt-1.5 text-lg font-semibold text-neutral-900">
                                {ratio.toFixed(2)}:1
                            </p>
                            <span className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${ratio >= 4.5 ? "bg-green-50 text-green-600" : ratio >= 3 ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-500"}`}>
                                {wcagLabel(ratio)}
                            </span>
                        </div>
                    ))}
                </div>

                {favorites.length > 0 && (
                    <Section title={`Favourites · ${favorites.length}`}>
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(2.5rem,1fr))] gap-2.5">
                            {favorites.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setColor(toColor(c))}
                                    onContextMenu={(e) => {
                                        e.preventDefault();
                                        setFavorites((prev) => {
                                            const next = prev.filter((x) => x !== c);
                                            try { localStorage.setItem(FAVORITES_KEY, JSON.stringify(next)); } catch { /* noop */ }
                                            return next;
                                        });
                                    }}
                                    title={`${c.toUpperCase()} · right-click to remove`}
                                    className={`aspect-square rounded-xl border transition hover:scale-110 active:scale-95 ${c === hex ? "border-neutral-900 ring-2 ring-neutral-900/20" : "border-black/5"}`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                    </Section>
                )}

                <Section
                    title="Recent"
                    action={
                        history.length > 0 ? (
                            <button
                                type="button"
                                onClick={clearHistory}
                                title="Clear recent"
                                className="rounded-full p-2 text-neutral-300 transition hover:bg-red-50 hover:text-red-500 active:scale-90"
                            >
                                <TrashIcon size={15} />
                            </button>
                        ) : (
                            <SwatchesIcon size={15} className="text-neutral-300" />
                        )
                    }
                >
                    {history.length === 0 ? (
                        <p className="py-1 text-sm text-neutral-300">Colours you pick will show up here.</p>
                    ) : (
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(2.5rem,1fr))] gap-2.5">
                            {history.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setColor(toColor(c))}
                                    title={c.toUpperCase()}
                                    className={`aspect-square rounded-xl border transition hover:scale-110 active:scale-95 ${c === hex ? "border-neutral-900 ring-2 ring-neutral-900/20" : "border-black/5"}`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                    )}
                </Section>

                <div className="flex items-center gap-3 pb-2">
                    <button
                        type="button"
                        onClick={() => copyText("all", `${hex.toUpperCase()} · ${rgbStr} · ${hslStr}`)}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-neutral-900 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-neutral-800 active:scale-[0.99]"
                    >
                        {copiedKey === "all" ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
                        {copiedKey === "all" ? "Copied!" : "Copy all formats"}
                    </button>
                    <IconButton title="Reset colour" onClick={() => setColor(toColor("#a866ff"))}>
                        <ArrowCounterClockwiseIcon size={17} />
                    </IconButton>
                </div>

                <p className="pb-2 text-center text-xs text-neutral-300">
                    Tip: right-click a favourite to remove it
                </p>
            </div>
        </div>
    );
}

function toColor(hex) {
    return ColorService.convert("hex", ColorService.toHex(hex));
}

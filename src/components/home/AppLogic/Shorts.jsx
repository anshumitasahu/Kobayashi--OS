import { useCallback, useEffect, useRef, useState } from "react";
import {
    PlayIcon,
    PauseIcon,
    SpeakerHighIcon,
    SpeakerSlashIcon,
    ThumbsUpIcon,
    ThumbsDownIcon,
    ChatCircleIcon,
    ShareFatIcon,
    BookmarkSimpleIcon,
    PlusIcon,
    XIcon,
    CaretUpIcon,
    CaretDownIcon,
    ShuffleIcon,
    TrashIcon,
    HeartIcon,
} from "@phosphor-icons/react";

const DEFAULT_SHORTS = [
    { id: "U4yM3Ilu4Og", title: "POV: your code works on the first try", channel: "devtok", handle: "@devtok", likes: 128400 },
    { id: "DG--Ubbq5MU", title: "Things only programmers will understand", channel: "codememes", handle: "@codememes", likes: 89400 },
    { id: "7rvmOWlvJHI", title: "One more episode… at 3 AM", channel: "midnightclips", handle: "@midnightclips", likes: 231000 },
    { id: "68L0G7c3cLk", title: "Wait for the drop 🔥", channel: "vibecuts", handle: "@vibecuts", likes: 67200 },
    { id: "57_RLMhmpJA", title: "This never gets old", channel: "loopstation", handle: "@loopstation", likes: 45200 },
];

const MOCK_COMMENTS = [
    { user: "doomscroller99", time: "2h", text: "Came here for 5 minutes, it's been 3 hours.", likes: 1204 },
    { user: "pixel.ash", time: "5h", text: "The algorithm really knows me too well.", likes: 386 },
    { user: "just_one_more", time: "1d", text: "Watching this for the 47th time, no regrets.", likes: 97 },
];

function parseShortId(input) {
    const raw = input.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(raw)) return raw;
    try {
        const url = new URL(raw.includes("://") ? raw : `https://${raw}`);
        if (url.hostname.includes("youtu.be")) {
            const id = url.pathname.slice(1).split("/")[0];
            if (/^[a-zA-Z0-9_-]{11}$/.test(id)) return id;
        }
        const v = url.searchParams.get("v");
        if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;
        const match = url.pathname.match(/\/(?:embed|shorts|live)\/([a-zA-Z0-9_-]{11})/);
        if (match) return match[1];
    } catch {
        return null;
    }
    return null;
}

function command(iframe, func) {
    try {
        iframe?.contentWindow?.postMessage(
            JSON.stringify({ event: "command", func, args: [] }),
            "*"
        );
    } catch {
        /* iframe not ready yet */
    }
}

function formatCount(n) {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return `${n}`;
}

function loadJSON(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}

function shuffled(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

export default function Shorts() {
    const [shorts, setShorts] = useState(() => [...DEFAULT_SHORTS, ...loadJSON("koba-shorts-custom", [])]);
    const [feed, setFeed] = useState(() => [...DEFAULT_SHORTS, ...loadJSON("koba-shorts-custom", [])]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [muted, setMuted] = useState(true);
    const [paused, setPaused] = useState(false);
    const [liked, setLiked] = useState(() => new Set(loadJSON("koba-shorts-liked", [])));
    const [disliked, setDisliked] = useState(() => new Set());
    const [saved, setSaved] = useState(() => new Set(loadJSON("koba-shorts-saved", [])));
    const [showAdd, setShowAdd] = useState(false);
    const [addInput, setAddInput] = useState("");
    const [addError, setAddError] = useState("");
    const [showComments, setShowComments] = useState(false);
    const [heartBurst, setHeartBurst] = useState(false);
    const [toast, setToast] = useState("");

    const containerRef = useRef(null);
    const iframesRef = useRef([]);
    const activeRef = useRef(0);
    const pausedRef = useRef(false);
    const mutedRef = useRef(true);
    const shortsRef = useRef(shorts);
    useEffect(() => { shortsRef.current = shorts; }, [shorts]);

    const active = feed[activeIndex] || feed[0];

    useEffect(() => {
        try {
            localStorage.setItem("koba-shorts-custom", JSON.stringify(shorts.filter((s) => s.custom)));
            localStorage.setItem("koba-shorts-liked", JSON.stringify([...liked]));
            localStorage.setItem("koba-shorts-saved", JSON.stringify([...saved]));
        } catch {
            /* storage unavailable */
        }
    }, [shorts, liked, saved]);

    const pauseAllExcept = useCallback((exceptIdx) => {
        iframesRef.current.forEach((el, i) => {
            if (el && i !== exceptIdx) command(el, "pauseVideo");
        });
    }, []);

    const playActive = useCallback((idx) => {
        const el = iframesRef.current[idx];
        if (!el) return;
        command(el, mutedRef.current ? "mute" : "unMute");
        if (!pausedRef.current) command(el, "playVideo");
    }, []);

    const appendMore = useCallback(() => {
        setFeed((f) => {
            if (f.length > 120) return f;
            return [...f, ...shuffled(shortsRef.current)];
        });
    }, []);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        let raf = 0;
        const onScroll = () => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                const h = container.clientHeight;
                if (!h) return;
                const idx = Math.min(feed.length - 1, Math.max(0, Math.round(container.scrollTop / h)));
                if (idx !== activeRef.current) {
                    activeRef.current = idx;
                    pausedRef.current = false;
                    setPaused(false);
                    setActiveIndex(idx);
                }
                if (container.scrollTop + h > container.scrollHeight - h * 2) appendMore();
            });
        };
        container.addEventListener("scroll", onScroll, { passive: true });
        container.focus({ preventScroll: true });
        return () => {
            container.removeEventListener("scroll", onScroll);
            cancelAnimationFrame(raf);
        };
    }, [feed.length, appendMore]);

    useEffect(() => {
        pauseAllExcept(activeIndex);
        playActive(activeIndex);
    }, [activeIndex, feed.length, pauseAllExcept, playActive]);

    useEffect(() => {
        mutedRef.current = muted;
        const el = iframesRef.current[activeRef.current];
        if (el) command(el, muted ? "mute" : "unMute");
    }, [muted]);

    const goTo = (idx) => {
        const container = containerRef.current;
        if (!container) return;
        const clamped = Math.min(feed.length - 1, Math.max(0, idx));
        container.scrollTo({ top: clamped * container.clientHeight, behavior: "smooth" });
    };

    const togglePlay = () => {
        const el = iframesRef.current[activeRef.current];
        if (pausedRef.current) {
            pausedRef.current = false;
            setPaused(false);
            command(el, "playVideo");
        } else {
            pausedRef.current = true;
            setPaused(true);
            command(el, "pauseVideo");
        }
    };

    const toggleIn = (setter) => (id) =>
        setter((s) => {
            const next = new Set(s);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });

    const toggleLike = (id) => {
        toggleIn(setLiked)(id);
        if (!liked.has(id)) setDisliked((s) => { const n = new Set(s); n.delete(id); return n; });
    };

    const doubleTapLike = () => {
        if (active && !liked.has(active.id)) toggleLike(active.id);
        setHeartBurst(true);
        setTimeout(() => setHeartBurst(false), 700);
    };

    const flashToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(""), 1800);
    };

    const share = async (id) => {
        const link = `https://www.youtube.com/shorts/${id}`;
        try {
            await navigator.clipboard.writeText(link);
            flashToast("Link copied to clipboard");
        } catch {
            flashToast(link);
        }
    };

    const reshuffle = () => {
        const current = feed[activeRef.current];
        const rest = shuffled(shorts.filter((s) => s.id !== current?.id));
        setFeed(current ? [current, ...rest] : rest);
        containerRef.current?.scrollTo({ top: 0 });
        activeRef.current = 0;
        setActiveIndex(0);
        flashToast("Feed reshuffled");
    };

    const addShort = async (e) => {
        e.preventDefault();
        const id = parseShortId(addInput);
        if (!id) {
            setAddError("Paste a valid YouTube / Shorts link or 11-character video ID.");
            return;
        }
        if (shorts.some((s) => s.id === id)) {
            const idx = feed.findIndex((s) => s.id === id);
            setShowAdd(false);
            setAddInput("");
            setAddError("");
            if (idx >= 0) goTo(idx);
            return;
        }
        let title = "Custom Short";
        let channel = "youtube";
        try {
            const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/shorts/${id}&format=json`);
            if (res.ok) {
                const data = await res.json();
                title = data.title || title;
                channel = (data.author_name || channel).toLowerCase().replace(/\s+/g, "");
            }
        } catch {
            /* keep defaults when oembed is unreachable */
        }
        const custom = { id, title, channel, handle: `@${channel}`, likes: 0, custom: true };
        const next = [custom, ...shorts];
        setShorts(next);
        shortsRef.current = next;
        setFeed([custom, ...feed]);
        setShowAdd(false);
        setAddInput("");
        setAddError("");
        setTimeout(() => goTo(0), 50);
        flashToast("Short added to your feed");
    };

    const removeShort = (id) => {
        const next = shorts.filter((s) => s.id !== id);
        setShorts(next);
        shortsRef.current = next;
        setFeed((f) => (f.length <= 1 ? next : f.filter((s) => s.id !== id)));
        flashToast("Short removed");
    };

    const onKeyDown = (e) => {
        if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
        if (e.key === "ArrowDown" || e.key === "j") { e.preventDefault(); goTo(activeRef.current + 1); }
        else if (e.key === "ArrowUp" || e.key === "k") { e.preventDefault(); goTo(activeRef.current - 1); }
        else if (e.key === " ") { e.preventDefault(); togglePlay(); }
        else if (e.key === "m") setMuted((m) => !m);
        else if (e.key === "l" && active) toggleLike(active.id);
    };

    const railBtn = "flex flex-col items-center gap-1 text-white drop-shadow-lg cursor-pointer active:scale-90 transition-transform";

    return (
        <div className="relative h-full w-full bg-neutral-950 text-white overflow-hidden select-none" onKeyDown={onKeyDown}>
            <div className="absolute top-0 inset-x-0 z-20 flex items-center gap-2 px-3 py-2.5 bg-gradient-to-b from-black/70 to-transparent pointer-events-none">
                <span className="font-bold tracking-tight text-lg pointer-events-auto">Shorts</span>
                <div className="ml-auto flex items-center gap-1 pointer-events-auto">
                    <button onClick={reshuffle} title="Reshuffle feed" className="p-2 rounded-full hover:bg-white/15 cursor-pointer">
                        <ShuffleIcon size={18} />
                    </button>
                    <button onClick={() => goTo(activeRef.current - 1)} title="Previous (↑/k)" className="p-2 rounded-full hover:bg-white/15 cursor-pointer">
                        <CaretUpIcon size={18} weight="bold" />
                    </button>
                    <button onClick={() => goTo(activeRef.current + 1)} title="Next (↓/j)" className="p-2 rounded-full hover:bg-white/15 cursor-pointer">
                        <CaretDownIcon size={18} weight="bold" />
                    </button>
                    <button
                        onClick={() => { setShowAdd(true); setAddError(""); }}
                        title="Add a Short"
                        className="flex items-center gap-1 h-8 px-3 rounded-full bg-white text-black text-sm font-medium hover:bg-neutral-200 cursor-pointer"
                    >
                        <PlusIcon size={15} weight="bold" /> Add
                    </button>
                </div>
            </div>

            <div ref={containerRef} tabIndex={0} className="h-full w-full overflow-y-scroll snap-y snap-mandatory outline-none" style={{ scrollbarWidth: "none" }}>
                {feed.map((short, index) => {
                    const isActive = index === activeIndex;
                    const isLiked = liked.has(short.id);
                    return (
                        <div key={`${short.id}-${index}`} className="relative h-full w-full snap-start snap-always shrink-0 flex justify-center">
                            <div className="relative h-full w-full sm:max-w-[400px] sm:py-10">
                                <div className="relative h-full w-full sm:rounded-2xl overflow-hidden bg-black sm:ring-1 sm:ring-white/10">
                                    <iframe
                                        ref={(el) => { iframesRef.current[index] = el; }}
                                        className="absolute inset-0 h-full w-full"
                                        src={`https://www.youtube.com/embed/${short.id}?enablejsapi=1&autoplay=0&mute=1&playsinline=1&controls=0&rel=0&loop=1&playlist=${short.id}`}
                                        title={short.title}
                                        allow="autoplay; encrypted-media; picture-in-picture"
                                        allowFullScreen
                                    />

                                    <button
                                        aria-label={paused && isActive ? "Play" : "Pause"}
                                        onClick={togglePlay}
                                        onDoubleClick={doubleTapLike}
                                        className="absolute inset-0 z-[5] cursor-pointer"
                                    />

                                    {heartBurst && isActive && (
                                        <span className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                                            <HeartIcon size={96} weight="fill" className="text-red-500 animate-ping" />
                                        </span>
                                    )}

                                    {paused && isActive && (
                                        <span className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                                            <span className="w-16 h-16 rounded-full bg-black/60 flex items-center justify-center">
                                                <PlayIcon size={30} weight="fill" />
                                            </span>
                                        </span>
                                    )}

                                    <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
                                    <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

                                    <div className="absolute right-2 bottom-24 z-10 flex flex-col gap-4">
                                        <button onClick={() => toggleLike(short.id)} className={railBtn} title="Like (l)">
                                            <ThumbsUpIcon size={26} weight={isLiked ? "fill" : "regular"} className={isLiked ? "text-red-500" : ""} />
                                            <span className="text-[11px] font-medium">{formatCount(short.likes + (isLiked ? 1 : 0))}</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                toggleIn(setDisliked)(short.id);
                                                if (!disliked.has(short.id)) setLiked((s) => { const n = new Set(s); n.delete(short.id); return n; });
                                            }}
                                            className={railBtn}
                                            title="Dislike"
                                        >
                                            <ThumbsDownIcon size={26} weight={disliked.has(short.id) ? "fill" : "regular"} />
                                            <span className="text-[11px] font-medium">Dislike</span>
                                        </button>
                                        <button onClick={() => setShowComments(true)} className={railBtn} title="Comments">
                                            <ChatCircleIcon size={26} />
                                            <span className="text-[11px] font-medium">{MOCK_COMMENTS.length}</span>
                                        </button>
                                        <button onClick={() => share(short.id)} className={railBtn} title="Share">
                                            <ShareFatIcon size={26} />
                                            <span className="text-[11px] font-medium">Share</span>
                                        </button>
                                        <button onClick={() => toggleIn(setSaved)(short.id)} className={railBtn} title="Save">
                                            <BookmarkSimpleIcon size={26} weight={saved.has(short.id) ? "fill" : "regular"} className={saved.has(short.id) ? "text-yellow-400" : ""} />
                                            <span className="text-[11px] font-medium">Save</span>
                                        </button>
                                        {short.custom && (
                                            <button onClick={() => removeShort(short.id)} className={railBtn} title="Remove">
                                                <TrashIcon size={26} className="text-red-400" />
                                                <span className="text-[11px] font-medium">Remove</span>
                                            </button>
                                        )}
                                    </div>

                                    <div className="absolute left-3 right-16 bottom-4 z-10 pointer-events-none">
                                        <p className="font-semibold text-[15px] drop-shadow">@{short.channel}</p>
                                        <p className="text-[13px] text-neutral-200 leading-snug line-clamp-2 mt-0.5 drop-shadow">{short.title}</p>
                                        <div className="flex items-center gap-2 mt-2 pointer-events-auto">
                                            <button
                                                onClick={() => setMuted((m) => !m)}
                                                className="flex items-center gap-1.5 h-8 px-3 rounded-full bg-white/15 backdrop-blur text-xs font-medium hover:bg-white/25 cursor-pointer"
                                                title="Toggle sound (m)"
                                            >
                                                {muted ? <SpeakerSlashIcon size={15} /> : <SpeakerHighIcon size={15} />}
                                                {muted ? "Tap for sound" : "Sound on"}
                                            </button>
                                            <button
                                                onClick={togglePlay}
                                                className="p-2 rounded-full bg-white/15 backdrop-blur hover:bg-white/25 cursor-pointer"
                                                title="Play/Pause (space)"
                                            >
                                                {paused && isActive ? <PlayIcon size={15} weight="fill" /> : <PauseIcon size={15} weight="fill" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {showComments && active && (
                <div className="absolute inset-0 z-30 flex items-end justify-center" onClick={() => setShowComments(false)}>
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="w-full sm:max-w-[400px] max-h-[55%] bg-[#1c1c1c] rounded-t-2xl border-t border-white/10 flex flex-col overflow-hidden"
                    >
                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                            <p className="font-semibold text-sm">Comments ({MOCK_COMMENTS.length})</p>
                            <button onClick={() => setShowComments(false)} className="p-1.5 rounded-full hover:bg-white/10 cursor-pointer">
                                <XIcon size={18} />
                            </button>
                        </div>
                        <div className="flex flex-col gap-4 p-4 overflow-y-auto">
                            {MOCK_COMMENTS.map((c) => (
                                <div key={c.user} className="flex gap-3">
                                    <span className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center font-bold text-sm shrink-0">
                                        {c.user.charAt(0).toUpperCase()}
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-[13px]"><span className="font-medium">@{c.user}</span> <span className="text-neutral-500">{c.time}</span></p>
                                        <p className="text-sm text-neutral-200 mt-0.5">{c.text}</p>
                                        <p className="flex items-center gap-1 mt-1 text-xs text-neutral-400">
                                            <ThumbsUpIcon size={14} /> {c.likes}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {showAdd && (
                <div className="absolute inset-0 z-40 bg-black/70 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
                    <form
                        onSubmit={addShort}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-md bg-[#1c1c1c] rounded-2xl p-5 border border-white/10"
                    >
                        <div className="flex items-center justify-between mb-1">
                            <h2 className="font-semibold text-lg">Add a Short</h2>
                            <button type="button" onClick={() => setShowAdd(false)} className="p-1.5 rounded-full hover:bg-white/10 cursor-pointer">
                                <XIcon size={18} />
                            </button>
                        </div>
                        <p className="text-sm text-neutral-400 mb-3">Paste any YouTube / Shorts link or video ID. It plays first and stays saved.</p>
                        <input
                            autoFocus
                            value={addInput}
                            onChange={(e) => { setAddInput(e.target.value); setAddError(""); }}
                            placeholder="https://www.youtube.com/shorts/…"
                            className="w-full h-10 px-3 rounded-lg bg-white/10 border border-white/10 outline-none text-sm placeholder:text-neutral-500 focus:border-red-500/70"
                        />
                        {addError && <p className="text-xs text-red-400 mt-2">{addError}</p>}
                        <div className="flex justify-end gap-2 mt-4">
                            <button type="button" onClick={() => setShowAdd(false)} className="h-9 px-4 rounded-full text-sm hover:bg-white/10 cursor-pointer">
                                Cancel
                            </button>
                            <button type="submit" className="h-9 px-4 rounded-full text-sm font-medium bg-white text-black hover:bg-neutral-200 cursor-pointer">
                                Add Short
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {toast && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white text-black text-sm font-medium px-4 py-2 rounded-full shadow-lg whitespace-nowrap">
                    {toast}
                </div>
            )}

            <p className="absolute bottom-2 left-3 z-10 text-[10px] text-neutral-500 pointer-events-none hidden sm:block">
                ↑/↓ or j/k to scroll • space to pause • m to mute • double-tap to like
            </p>
        </div>
    );
}

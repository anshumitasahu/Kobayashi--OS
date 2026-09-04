import { useEffect, useMemo, useRef, useState } from "react";
import {
    ListIcon,
    MagnifyingGlassIcon,
    XIcon,
    HouseIcon,
    FireIcon,
    UsersThreeIcon,
    ClockCounterClockwiseIcon,
    ThumbsUpIcon,
    ThumbsDownIcon,
    ShareFatIcon,
    BookmarkSimpleIcon,
    BellIcon,
    PlusIcon,
    ArrowLeftIcon,
    CheckCircleIcon,
    PlayIcon,
} from "@phosphor-icons/react";

const BASE_VIDEOS = [
    {
        id: "-u3vE84Wo_U",
        title: "Create A Portfolio Website Using HTML and CSS Only - Easy Tutorial",
        channel: "Pro Coder",
        handle: "@procoder09",
        views: "412K views",
        age: "1 year ago",
        duration: "18:24",
        category: "Web Dev",
        desc: "Learn how to build a clean, responsive portfolio website from scratch using only HTML and CSS. Perfect for beginners putting together their first real project.",
    },
    {
        id: "jVx-vCjU_DE",
        title: "State of Coders in AI ERA",
        channel: "Piyush Garg",
        handle: "@piyushgargdev",
        views: "286K views",
        age: "3 months ago",
        duration: "24:31",
        category: "AI",
        desc: "Where do developers stand in the age of AI coding assistants? A grounded take on skills that still matter, hiring shifts, and how to stay relevant.",
    },
    {
        id: "mxHoPYFsTuk",
        title: "This Simple Trick Makes Your Website 83% Better Looking",
        channel: "Web Dev Simplified",
        handle: "@WebDevSimplified",
        views: "891K views",
        age: "8 months ago",
        duration: "9:47",
        category: "CSS",
        desc: "One small design habit that instantly levels up spacing, hierarchy, and polish on any website — with before/after examples you can steal today.",
    },
    {
        id: "b9eMGE7QtTk",
        title: "React JS Full Course | Build an App and Master React in 1 Hour",
        channel: "JavaScript Mastery",
        handle: "@javascriptmastery",
        views: "1.2M views",
        age: "2 years ago",
        duration: "1:00:12",
        category: "React",
        desc: "A fast-paced React crash course: components, props, state, hooks, and a complete app build — everything you need to get productive in an hour.",
    },
    {
        id: "dL1htoxiQLY",
        title: "Every React Concept Explained: The Core Mental Model",
        channel: "The Digital Architect",
        handle: "@RomTechDocs",
        views: "97K views",
        age: "5 months ago",
        duration: "32:10",
        category: "React",
        desc: "Stop memorizing hooks. This video builds the core mental model behind React — rendering, state, effects, and data flow — so every concept clicks.",
    },
    {
        id: "AYO4qHAnLQI",
        title: "Zustand Tutorial for Beginners - The Only Course You Will Ever Need",
        channel: "Code Genix",
        handle: "@codegenix",
        views: "64K views",
        age: "6 months ago",
        duration: "41:05",
        category: "Coding",
        desc: "Minimal, fast global state with Zustand. From your first store to slices, selectors, and persistence — a complete beginner-to-confident guide.",
    },
];

const CATEGORIES = ["All", "Coding", "React", "Web Dev", "AI", "CSS"];

const MOCK_COMMENTS = [
    { user: "dev_daily", time: "2 weeks ago", text: "The pacing on this is perfect. Watched it twice and picked up something new both times.", likes: 214 },
    { user: "pixelNerd", time: "1 month ago", text: "This finally made the concept click for me after months of confusion. Instant subscribe.", likes: 96 },
    { user: "code.with.ash", time: "3 days ago", text: "Came for one tip, stayed for the whole thing. The examples are genuinely useful.", likes: 41 },
];

function parseYouTubeId(input) {
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
        const match = url.pathname.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
        if (match) return match[1];
    } catch {
        return null;
    }
    return null;
}

function channelColor(name) {
    const palette = ["#7c3aed", "#db2777", "#0284c7", "#059669", "#ea580c", "#4f46e5", "#be123c", "#0d9488"];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
    return palette[hash % palette.length];
}

export default function YouTube() {
    const [videos, setVideos] = useState(BASE_VIDEOS);
    const [query, setQuery] = useState("");
    const [committedQuery, setCommittedQuery] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileSearch, setMobileSearch] = useState(false);
    const [view, setView] = useState("home");
    const [category, setCategory] = useState("All");
    const [activeId, setActiveId] = useState(null);
    const [liked, setLiked] = useState(() => new Set());
    const [disliked, setDisliked] = useState(() => new Set());
    const [subs, setSubs] = useState(() => new Set());
    const [saved, setSaved] = useState(() => new Set());
    const [history, setHistory] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("koba-yt-history") || "[]");
        } catch {
            return [];
        }
    });
    const [showAdd, setShowAdd] = useState(false);
    const [addInput, setAddInput] = useState("");
    const [addError, setAddError] = useState("");

    const rootRef = useRef(null);
    useEffect(() => {
        if (rootRef.current && rootRef.current.clientWidth < 768) setSidebarOpen(false);
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem("koba-yt-history", JSON.stringify(history.slice(0, 30)));
        } catch {
            /* storage unavailable */
        }
    }, [history]);

    const openVideo = (id) => {
        setActiveId(id);
        setHistory((h) => [id, ...h.filter((x) => x !== id)].slice(0, 30));
    };

    const toggleIn = (setter) => (id) =>
        setter((s) => {
            const next = new Set(s);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    const toggleLike = toggleIn(setLiked);
    const toggleDislike = toggleIn(setDisliked);
    const toggleSub = toggleIn(setSubs);
    const toggleSave = toggleIn(setSaved);

    const filtered = useMemo(() => {
        const q = committedQuery.trim().toLowerCase();
        let list = [...videos];
        if (view === "trending") list = [...list].reverse();
        if (view === "subs") list = list.filter((v) => subs.has(v.channel));
        if (view === "history") list = history.map((id) => videos.find((v) => v.id === id)).filter(Boolean);
        if (view === "liked") list = list.filter((v) => liked.has(v.id));
        if (view === "saved") list = list.filter((v) => saved.has(v.id));
        if (category !== "All") list = list.filter((v) => v.category === category);
        if (q) list = list.filter((v) => `${v.title} ${v.channel}`.toLowerCase().includes(q));
        return list;
    }, [videos, view, category, committedQuery, subs, history, liked, saved]);

    const active = videos.find((v) => v.id === activeId) || null;
    const upNext = videos.filter((v) => v.id !== activeId);

    const submitSearch = (e) => {
        e?.preventDefault();
        setCommittedQuery(query);
        if (activeId) setActiveId(null);
        if (view !== "home") setView("home");
        setMobileSearch(false);
    };

    const addVideo = async (e) => {
        e.preventDefault();
        const id = parseYouTubeId(addInput);
        if (!id) {
            setAddError("Paste a valid YouTube link or 11-character video ID.");
            return;
        }
        if (videos.some((v) => v.id === id)) {
            openVideo(id);
            setShowAdd(false);
            setAddInput("");
            setAddError("");
            return;
        }
        let title = "Custom YouTube video";
        let channel = "YouTube";
        try {
            const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`);
            if (res.ok) {
                const data = await res.json();
                title = data.title || title;
                channel = data.author_name || channel;
            }
        } catch {
            /* keep defaults when oembed is unreachable */
        }
        const custom = {
            id,
            title,
            channel,
            handle: "@youtube",
            views: "—",
            age: "just added",
            duration: "—",
            category: "Coding",
            desc: "Added via link. Open the video to watch it here.",
        };
        setVideos((v) => [custom, ...v]);
        setShowAdd(false);
        setAddInput("");
        setAddError("");
        setView("home");
        setCategory("All");
        setCommittedQuery("");
        setQuery("");
        openVideo(id);
    };

    const navItem = (key, icon, label, badge) => (
        <button
            key={key}
            onClick={(e) => {
                setView(key);
                setActiveId(null);
                const root = e.currentTarget.closest("[data-yt-root]");
                if (root && root.clientWidth < 768) setSidebarOpen(false);
            }}
            className={`flex items-center gap-4 w-full px-3 h-10 rounded-lg text-sm transition-colors cursor-pointer ${
                view === key && !activeId ? "bg-white/10 font-medium" : "hover:bg-white/10 text-neutral-200"
            } ${!sidebarOpen ? "@min-[768px]:flex-col @min-[768px]:gap-1.5 @min-[768px]:h-16 @min-[768px]:justify-center @min-[768px]:text-[10px] @min-[768px]:px-1" : ""}`}
            title={label}
        >
            <span className="shrink-0">{icon}</span>
            <span className={`truncate ${!sidebarOpen ? "@min-[768px]:truncate @min-[768px]:max-w-full" : ""}`}>{label}</span>
            {badge > 0 && sidebarOpen && (
                <span className="ml-auto text-[10px] bg-white/10 rounded-full px-1.5 py-0.5 tabular-nums">{badge}</span>
            )}
        </button>
    );

    const searchBar = (inMobileRow) => (
        <form
            onSubmit={submitSearch}
            className={`flex items-center ${inMobileRow ? "flex-1" : "flex-1 max-w-xl mx-auto hidden @min-[640px]:flex"}`}
        >
            <div className="flex flex-1 items-center bg-white/10 border border-white/10 rounded-l-full px-4 h-9 focus-within:border-blue-500/70">
                {inMobileRow && (
                    <button type="button" onClick={() => setMobileSearch(false)} className="mr-2 text-neutral-300 hover:text-white cursor-pointer">
                        <ArrowLeftIcon size={18} />
                    </button>
                )}
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search"
                    className="bg-transparent outline-none flex-1 text-sm placeholder:text-neutral-500 min-w-0"
                />
                {query && (
                    <button type="button" onClick={() => { setQuery(""); setCommittedQuery(""); }} className="text-neutral-400 hover:text-white cursor-pointer">
                        <XIcon size={16} weight="bold" />
                    </button>
                )}
            </div>
            <button
                type="submit"
                className="h-9 px-4 @min-[640px]:px-5 bg-white/10 border border-l-0 border-white/10 rounded-r-full text-neutral-200 hover:bg-white/20 cursor-pointer"
                title="Search"
            >
                <MagnifyingGlassIcon size={18} />
            </button>
        </form>
    );

    return (
        <div ref={rootRef} data-yt-root className="h-full w-full flex flex-col bg-[#0f0f0f] text-white rounded-lg overflow-hidden relative select-none @container">
            <header className="h-14 shrink-0 flex items-center gap-1 @min-[640px]:gap-2 px-2 @min-[640px]:px-4">
                {mobileSearch ? (
                    searchBar(true)
                ) : (
                    <>
                        <button
                            onClick={() => setSidebarOpen((o) => !o)}
                            className="p-2 rounded-full hover:bg-white/10 cursor-pointer"
                            title="Menu"
                        >
                            <ListIcon size={20} />
                        </button>
                        <button
                            onClick={() => { setActiveId(null); setView("home"); setCommittedQuery(""); setQuery(""); setCategory("All"); }}
                            className="flex items-center gap-1.5 pr-2 cursor-pointer"
                            title="KobaTube Home"
                        >
                            <img src="./colloid/youtube.svg" alt="YouTube" className="w-7 h-7" />
                            <span className="font-bold tracking-tighter text-lg hidden @min-[400px]:block">
                                Koba<span className="text-red-500">Tube</span>
                            </span>
                        </button>
                        {searchBar(false)}
                        <div className="flex items-center gap-0.5 @min-[640px]:gap-1 ml-auto @min-[640px]:ml-0">
                            <button onClick={() => setMobileSearch(true)} className="@min-[640px]:hidden p-2 rounded-full hover:bg-white/10 cursor-pointer" title="Search">
                                <MagnifyingGlassIcon size={20} />
                            </button>
                            <button
                                onClick={() => { setShowAdd(true); setAddError(""); }}
                                className="hidden @min-[640px]:flex items-center gap-1.5 h-9 px-3 rounded-full bg-white/10 hover:bg-white/20 text-sm cursor-pointer"
                                title="Add video by link"
                            >
                                <PlusIcon size={16} weight="bold" /> <span className="hidden @min-[1024px]:inline">Add video</span>
                            </button>
                            <button onClick={() => { setShowAdd(true); setAddError(""); }} className="@min-[640px]:hidden p-2 rounded-full hover:bg-white/10 cursor-pointer" title="Add video">
                                <PlusIcon size={20} />
                            </button>
                            <button className="p-2 rounded-full hover:bg-white/10 cursor-pointer" title="Notifications">
                                <BellIcon size={20} />
                            </button>
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-purple-600 flex items-center justify-center text-sm font-bold ml-1">
                                K
                            </div>
                        </div>
                    </>
                )}
            </header>

            <div className="flex flex-1 min-h-0 relative">
                <aside
                    className={`shrink-0 hidden @min-[768px]:flex flex-col gap-0.5 p-3 overflow-y-auto transition-all duration-200 ${
                        sidebarOpen ? "w-56" : "w-[76px]"
                    }`}
                >
                    {navItem("home", <HouseIcon size={20} weight={view === "home" ? "fill" : "regular"} />, "Home")}
                    {navItem("trending", <FireIcon size={20} weight={view === "trending" ? "fill" : "regular"} />, "Trending")}
                    {navItem("subs", <UsersThreeIcon size={20} weight={view === "subs" ? "fill" : "regular"} />, "Subscriptions", subs.size)}
                    <div className={`my-2 border-t border-white/10 ${!sidebarOpen ? "@min-[768px]:mx-1" : ""}`} />
                    {navItem("history", <ClockCounterClockwiseIcon size={20} />, "History")}
                    {navItem("liked", <ThumbsUpIcon size={20} />, "Liked", liked.size)}
                    {navItem("saved", <BookmarkSimpleIcon size={20} />, "Watch Later", saved.size)}
                    {sidebarOpen && (
                        <div className="mt-3 hidden @min-[1024px]:block">
                            <p className="px-3 text-xs font-medium text-neutral-400 mb-1.5">Subscriptions</p>
                            {videos.slice(0, 5).map((v) => (
                                <button
                                    key={v.id}
                                    onClick={() => openVideo(v.id)}
                                    className="flex items-center gap-3 w-full px-3 h-10 rounded-lg hover:bg-white/10 text-sm cursor-pointer"
                                >
                                    <span
                                        className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                                        style={{ backgroundColor: channelColor(v.channel) }}
                                    >
                                        {v.channel.charAt(0).toUpperCase()}
                                    </span>
                                    <span className="truncate text-neutral-200">{v.channel}</span>
                                </button>
                            ))}
                            <p className="px-3 mt-4 text-[11px] leading-relaxed text-neutral-600">
                                KobaTube — a YouTube-style player for Kobayashi OS.
                            </p>
                        </div>
                    )}
                </aside>

                {sidebarOpen && (
                    <div className="absolute inset-y-0 left-0 z-30 w-60 bg-[#0f0f0f] border-r border-white/10 p-3 flex flex-col gap-0.5 @min-[768px]:hidden overflow-y-auto">
                        <div className="flex items-center gap-1 mb-2">
                            <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-full hover:bg-white/10 cursor-pointer">
                                <ListIcon size={20} />
                            </button>
                            <span className="font-bold tracking-tighter text-lg">Koba<span className="text-red-500">Tube</span></span>
                        </div>
                        {navItem("home", <HouseIcon size={20} />, "Home")}
                        {navItem("trending", <FireIcon size={20} />, "Trending")}
                        {navItem("subs", <UsersThreeIcon size={20} />, "Subscriptions", subs.size)}
                        <div className="my-2 border-t border-white/10" />
                        {navItem("history", <ClockCounterClockwiseIcon size={20} />, "History")}
                        {navItem("liked", <ThumbsUpIcon size={20} />, "Liked", liked.size)}
                        {navItem("saved", <BookmarkSimpleIcon size={20} />, "Watch Later", saved.size)}
                    </div>
                )}

                <main className="flex-1 min-w-0 overflow-y-auto @container">
                    {active ? (
                        <div className="flex flex-col @min-[1024px]:flex-row gap-5 p-3 @min-[640px]:p-5">
                            <div className="flex-1 min-w-0">
                                <button
                                    onClick={() => setActiveId(null)}
                                    className="flex items-center gap-1.5 text-sm text-neutral-400 hover:text-white mb-3 cursor-pointer"
                                >
                                    <ArrowLeftIcon size={16} /> Back to browse
                                </button>
                                <div className="w-full aspect-video rounded-xl overflow-hidden bg-black">
                                    <iframe
                                        key={active.id}
                                        src={`https://www.youtube.com/embed/${active.id}?autoplay=1&rel=0`}
                                        title={active.title}
                                        className="w-full h-full border-0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        referrerPolicy="strict-origin-when-cross-origin"
                                        allowFullScreen
                                    />
                                </div>
                                <h1 className="mt-3 text-base @min-[640px]:text-lg font-semibold leading-snug">{active.title}</h1>
                                <div className="mt-3 flex flex-wrap items-center gap-3">
                                    <div className="flex items-center gap-2.5 mr-auto">
                                        <span
                                            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0"
                                            style={{ backgroundColor: channelColor(active.channel) }}
                                        >
                                            {active.channel.charAt(0).toUpperCase()}
                                        </span>
                                        <div className="min-w-0">
                                            <p className="font-medium text-sm @min-[640px]:text-base truncate">{active.channel}</p>
                                            <p className="text-xs text-neutral-400">{active.handle}</p>
                                        </div>
                                        <button
                                            onClick={() => toggleSub(active.channel)}
                                            className={`ml-2 h-9 px-4 rounded-full text-sm font-medium cursor-pointer transition-colors ${
                                                subs.has(active.channel)
                                                    ? "bg-white/10 hover:bg-white/20"
                                                    : "bg-white text-black hover:bg-neutral-200"
                                            }`}
                                        >
                                            {subs.has(active.channel) ? "Subscribed" : "Subscribe"}
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <div className="flex items-center bg-white/10 rounded-full overflow-hidden h-9">
                                            <button
                                                onClick={() => { toggleLike(active.id); if (!liked.has(active.id)) setDisliked((s) => { const n = new Set(s); n.delete(active.id); return n; }); }}
                                                className={`flex items-center gap-1.5 pl-4 pr-3 h-full text-sm cursor-pointer hover:bg-white/10 ${liked.has(active.id) ? "text-blue-400" : ""}`}
                                            >
                                                <ThumbsUpIcon size={18} weight={liked.has(active.id) ? "fill" : "regular"} /> Like
                                            </button>
                                            <div className="w-px h-5 bg-white/15" />
                                            <button
                                                onClick={() => { toggleDislike(active.id); if (!disliked.has(active.id)) setLiked((s) => { const n = new Set(s); n.delete(active.id); return n; }); }}
                                                className={`px-3 h-full cursor-pointer hover:bg-white/10 ${disliked.has(active.id) ? "text-blue-400" : ""}`}
                                                title="Dislike"
                                            >
                                                <ThumbsDownIcon size={18} weight={disliked.has(active.id) ? "fill" : "regular"} />
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => { try { navigator.clipboard.writeText(`https://www.youtube.com/watch?v=${active.id}`); } catch { /* clipboard unavailable */ } }}
                                            className="flex items-center gap-1.5 h-9 px-4 rounded-full bg-white/10 hover:bg-white/20 text-sm cursor-pointer"
                                        >
                                            <ShareFatIcon size={18} /> Share
                                        </button>
                                        <button
                                            onClick={() => toggleSave(active.id)}
                                            className={`flex items-center gap-1.5 h-9 px-4 rounded-full text-sm cursor-pointer ${saved.has(active.id) ? "bg-blue-600 hover:bg-blue-500" : "bg-white/10 hover:bg-white/20"}`}
                                        >
                                            <BookmarkSimpleIcon size={18} weight={saved.has(active.id) ? "fill" : "regular"} />
                                            <span className="hidden @min-[640px]:inline">{saved.has(active.id) ? "Saved" : "Save"}</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-3 bg-white/10 rounded-xl p-3 text-sm">
                                    <p className="font-medium">{active.views} • {active.age}</p>
                                    <p className="mt-1 text-neutral-300 leading-relaxed">{active.desc}</p>
                                </div>
                                <div className="mt-5">
                                    <p className="font-semibold mb-3">{MOCK_COMMENTS.length} Comments</p>
                                    <div className="flex flex-col gap-4">
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

                            <div className="w-full @min-[1024px]:w-[360px] @min-[1400px]:w-[420px] shrink-0 flex flex-col gap-3">
                                <p className="font-semibold text-sm text-neutral-300">Up next</p>
                                {upNext.map((v) => (
                                    <button key={v.id} onClick={() => openVideo(v.id)} className="flex gap-2.5 text-left group cursor-pointer">
                                        <span className="relative w-28 @min-[480px]:w-40 @min-[900px]:w-44 shrink-0 aspect-video rounded-lg overflow-hidden bg-white/5">
                                            <img
                                                src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`}
                                                alt={v.title}
                                                loading="lazy"
                                                className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform"
                                            />
                                            <span className="absolute bottom-1 right-1 text-[11px] font-medium bg-black/80 rounded px-1 py-px tabular-nums">
                                                {v.duration}
                                            </span>
                                            <span className="absolute inset-0 m-auto w-8 h-8 rounded-full bg-black/60 items-center justify-center hidden group-hover:flex">
                                                <PlayIcon size={16} weight="fill" />
                                            </span>
                                        </span>
                                        <span className="min-w-0 py-0.5">
                                            <span className="block text-sm font-medium leading-snug line-clamp-2">{v.title}</span>
                                            <span className="block text-xs text-neutral-400 mt-1 truncate">{v.channel}</span>
                                            <span className="block text-xs text-neutral-500 truncate">{v.views} • {v.age}</span>
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="sticky top-0 z-10 bg-[#0f0f0f]/95 backdrop-blur px-3 @min-[640px]:px-5 py-3 flex gap-2 overflow-x-auto">
                                {CATEGORIES.map((c) => (
                                    <button
                                        key={c}
                                        onClick={() => setCategory(c)}
                                        className={`shrink-0 h-8 px-3 rounded-lg text-sm cursor-pointer transition-colors ${
                                            category === c ? "bg-white text-black font-medium" : "bg-white/10 hover:bg-white/20"
                                        }`}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                            <div className="px-3 @min-[640px]:px-5 pb-6">
                                {committedQuery && (
                                    <p className="py-2 text-sm text-neutral-400">
                                        Results for <span className="text-white font-medium">“{committedQuery}”</span>
                                        <button onClick={() => { setCommittedQuery(""); setQuery(""); }} className="ml-2 underline hover:text-white cursor-pointer">clear</button>
                                    </p>
                                )}
                                {filtered.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-center">
                                        {view === "history" ? <ClockCounterClockwiseIcon size={48} className="text-neutral-700" /> :
                                            view === "liked" ? <ThumbsUpIcon size={48} className="text-neutral-700" /> :
                                            view === "subs" ? <UsersThreeIcon size={48} className="text-neutral-700" /> :
                                            <MagnifyingGlassIcon size={48} className="text-neutral-700" />}
                                        <p className="mt-4 font-medium">
                                            {view === "history" ? "No watch history yet" :
                                                view === "liked" ? "No liked videos yet" :
                                                view === "subs" ? "No subscriptions yet — hit Subscribe on any video" :
                                                view === "saved" ? "Nothing saved for later" :
                                                "No videos found"}
                                        </p>
                                        <p className="text-sm text-neutral-500 mt-1 max-w-xs">
                                            {committedQuery
                                                ? "Try a different search, or paste a YouTube link with + Add video."
                                                : "Videos you watch, like, and subscribe to will show up here."}
                                        </p>
                                        <button
                                            onClick={() => { setShowAdd(true); setAddError(""); }}
                                            className="mt-4 flex items-center gap-1.5 h-9 px-4 rounded-full bg-white text-black text-sm font-medium hover:bg-neutral-200 cursor-pointer"
                                        >
                                            <PlusIcon size={16} weight="bold" /> Add a video by link
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 @min-[420px]:grid-cols-2 @min-[750px]:grid-cols-3 @min-[1100px]:grid-cols-4 gap-x-4 gap-y-7 pt-1 items-start">
                                        {filtered.map((v) => (
                                            <button key={v.id} onClick={() => openVideo(v.id)} className="text-left group cursor-pointer min-w-0 flex flex-col">
                                                <span className="relative block aspect-video rounded-xl overflow-hidden bg-white/5">
                                                    <img
                                                        src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`}
                                                        alt={v.title}
                                                        loading="lazy"
                                                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform"
                                                    />
                                                    <span className="absolute bottom-1.5 right-1.5 text-[11px] font-medium bg-black/80 rounded px-1 py-px tabular-nums">
                                                        {v.duration}
                                                    </span>
                                                    {liked.has(v.id) && (
                                                        <span className="absolute top-1.5 left-1.5 bg-black/70 rounded-full p-1.5" title="Liked">
                                                            <ThumbsUpIcon size={14} weight="fill" className="text-blue-400" />
                                                        </span>
                                                    )}
                                                    {subs.has(v.channel) && (
                                                        <span className="absolute top-1.5 right-1.5 bg-black/70 rounded-full p-1.5" title="Subscribed">
                                                            <CheckCircleIcon size={14} weight="fill" className="text-green-400" />
                                                        </span>
                                                    )}
                                                </span>
                                                <span className="flex gap-3 mt-2.5">
                                                    <span
                                                        className="w-9 h-9 rounded-full flex items-center justify-center font-bold shrink-0"
                                                        style={{ backgroundColor: channelColor(v.channel) }}
                                                    >
                                                        {v.channel.charAt(0).toUpperCase()}
                                                    </span>
                                                    <span className="min-w-0 flex-1">
                                                        <span className="block font-medium text-[15px] leading-snug line-clamp-2 min-h-[2.75em]">{v.title}</span>
                                                        <span className="block text-sm text-neutral-400 mt-1 truncate hover:text-neutral-200">{v.channel}</span>
                                                        <span className="block text-[13px] text-neutral-500 truncate">{v.views} • {v.age}</span>
                                                    </span>
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </main>
            </div>

            {showAdd && (
                <div className="absolute inset-0 z-40 bg-black/70 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
                    <form
                        onSubmit={addVideo}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-md bg-[#212121] rounded-2xl p-5 border border-white/10"
                    >
                        <div className="flex items-center justify-between mb-1">
                            <h2 className="font-semibold text-lg">Add video</h2>
                            <button type="button" onClick={() => setShowAdd(false)} className="p-1.5 rounded-full hover:bg-white/10 cursor-pointer">
                                <XIcon size={18} />
                            </button>
                        </div>
                        <p className="text-sm text-neutral-400 mb-3">Paste any YouTube link or video ID to play it here.</p>
                        <input
                            autoFocus
                            value={addInput}
                            onChange={(e) => { setAddInput(e.target.value); setAddError(""); }}
                            placeholder="https://www.youtube.com/watch?v=…"
                            className="w-full h-10 px-3 rounded-lg bg-white/10 border border-white/10 outline-none text-sm placeholder:text-neutral-500 focus:border-blue-500/70"
                        />
                        {addError && <p className="text-xs text-red-400 mt-2">{addError}</p>}
                        <div className="flex justify-end gap-2 mt-4">
                            <button type="button" onClick={() => setShowAdd(false)} className="h-9 px-4 rounded-full text-sm hover:bg-white/10 cursor-pointer">
                                Cancel
                            </button>
                            <button type="submit" className="h-9 px-4 rounded-full text-sm font-medium bg-white text-black hover:bg-neutral-200 cursor-pointer">
                                Play video
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

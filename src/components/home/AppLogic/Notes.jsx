import { useEffect, useMemo, useRef, useState } from "react";
import { PlusIcon, PushPinIcon, TrashIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";

const STORAGE_KEY = "notes";
const COLORS = ["#fef08a", "#fecdd3", "#bbf7d0", "#bfdbfe", "#e9d5ff", "#fed7aa"];

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

function loadNotes() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw === null) {
            return [
                { id: uid(), text: "Welcome to Sticky Notes!\nWrite anything here.", color: COLORS[0], createdAt: Date.now(), updatedAt: Date.now() },
                { id: uid(), text: "Ideas, todos, reminders...", color: COLORS[2], createdAt: Date.now(), updatedAt: Date.now() },
            ];
        }
        const parsed = JSON.parse(raw);
        if (typeof parsed === "string") {
            return parsed.trim()
                ? [{ id: uid(), text: parsed, color: COLORS[0], createdAt: Date.now(), updatedAt: Date.now() }]
                : [];
        }
        if (Array.isArray(parsed)) return parsed.filter((n) => n && typeof n.text === "string");
        return [];
    } catch {
        return [];
    }
}

const fmtDate = (ts) => new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });

function StickyCard({ color, tilt = "none", pin, style, children, className = "" }) {
    return (
        <div
            className={`relative flex flex-col overflow-hidden rounded-md border border-black/[0.07] ${className}`}
            style={{
                ...style,
                backgroundColor: color,
                boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                transform: tilt,
            }}
        >
            <span
                aria-hidden="true"
                className="pointer-events-none absolute bottom-0 right-0 h-6.5 w-6.5"
                style={{ backgroundColor: "rgba(0,0,0,0.10)", clipPath: "polygon(100% 0, 0 100%, 100% 100%)" }}
            />
            <span
                aria-hidden="true"
                className="pointer-events-none absolute bottom-0 right-0 h-6.5 w-6.5"
                style={{ backgroundColor: "rgba(255,255,255,0.65)", clipPath: "polygon(100% 5px, 5px 100%, 100% 100%)" }}
            />
            {pin}
            {children}
        </div>
    );
}

export default function Notes() {
    const [notes, setNotes] = useState(loadNotes);
    const [draft, setDraft] = useState("");
    const [draftColor, setDraftColor] = useState(COLORS[3]);
    const [query, setQuery] = useState("");
    const rootRef = useRef(null);
    const [cols, setCols] = useState(2);
    const wide = cols >= 3;

    useEffect(() => {
        const el = rootRef.current;
        if (!el) return;
        const update = () => {
            const w = el.clientWidth;
            setCols(w >= 1150 ? 4 : w >= 750 ? 3 : 2);
        };
        update();
        const ro = new ResizeObserver(update);
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
        } catch { /* ignore */ }
    }, [notes]);

    const visible = useMemo(() => {
        const q = query.trim().toLowerCase();
        const sorted = [...notes].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
        if (!q) return sorted;
        return sorted.filter((n) => n.text.toLowerCase().includes(q));
    }, [notes, query]);

    function addNote() {
        const text = draft.trim();
        if (!text) return;
        setNotes((prev) => [
            { id: uid(), text, color: draftColor, createdAt: Date.now(), updatedAt: Date.now() },
            ...prev,
        ]);
        setDraft("");
    }

    function updateNote(id, text) {
        setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, text, updatedAt: Date.now() } : n)));
    }

    function deleteNote(id) {
        setNotes((prev) => prev.filter((n) => n.id !== id));
    }

    function setColor(id, color) {
        setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, color, updatedAt: Date.now() } : n)));
    }

    return (
        <div
            ref={rootRef}
            className="flex h-full w-full flex-col bg-white"
        >
            <div className={`flex items-center gap-2 ${wide ? "px-5 pt-4" : "px-3 pt-2.5"}`}>
                <h2 className={`flex-1 font-semibold text-neutral-700 ${wide ? "text-sm" : "text-xs"}`}>
                    Sticky Notes
                </h2>
                <span className="text-[11px] tabular-nums text-neutral-500">{notes.length}</span>
                <div className="flex items-center gap-1.5 rounded-md border border-black/10 bg-white px-2 py-1 text-[11px] shadow-sm">
                    <MagnifyingGlassIcon size={12} className="text-neutral-400" />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search"
                        className={`bg-transparent outline-0 placeholder:text-neutral-400 ${wide ? "w-44" : "w-20"}`}
                    />
                </div>
            </div>

            <div
                className="grid flex-1 content-start overflow-y-auto"
                style={{
                    gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                    padding: wide ? "1.25rem" : "0.75rem",
                    gap: wide ? "1.5rem" : "1rem",
                }}
            >
                <StickyCard
                    color={draftColor}
                    tilt={wide ? "none" : "rotate(0.9deg)"}
                    className={wide ? "min-h-[220px]" : "min-h-[160px]"}
                    style={wide ? { gridColumn: "span 2" } : undefined}
                    pin={<span className={`absolute left-1/2 top-0 z-10 -translate-x-1/2 rounded-full bg-red-400 ring-2 ring-white/70 ${wide ? "h-5 w-5" : "h-4 w-4"}`} />}
                >
                    <div className={`flex flex-1 flex-col ${wide ? "p-4 pt-7" : "p-2.5 pt-5"}`}>
                        <textarea
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            onKeyDown={(e) => {
                                if ((e.ctrlKey || e.metaKey) && e.key === "Enter") addNote();
                            }}
                            placeholder="Write a new note..."
                            className={`w-full flex-1 resize-none bg-transparent leading-relaxed text-neutral-800 outline-0 placeholder:text-neutral-500 ${wide ? "min-h-[120px] text-sm" : "min-h-[70px] text-xs"}`}
                        />
                        <div className="mt-1.5 flex items-center gap-1">
                            {(wide ? COLORS : COLORS.slice(0, 4)).map((c) => (
                                <button
                                    key={c}
                                    onClick={() => setDraftColor(c)}
                                    title="Pick color"
                                    className={`h-3.5 w-3.5 rounded-full border ${draftColor === c ? "border-neutral-700" : "border-black/15"}`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                            <span className="flex-1" />
                            <button
                                onClick={addNote}
                                disabled={!draft.trim()}
                                title="Save note (Ctrl+Enter)"
                                className="flex items-center gap-1 rounded-md bg-neutral-900 px-2 py-1 text-[11px] font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30"
                            >
                                <PlusIcon size={11} weight="bold" /> Save
                            </button>
                        </div>
                    </div>
                </StickyCard>

                {visible.map((note, i) => (
                    <StickyCard
                        key={note.id}
                        color={note.color || COLORS[0]}
                        tilt={wide ? "none" : i % 2 === 0 ? "rotate(-1.1deg)" : "rotate(0.9deg)"}
                        className={`group ${wide ? "min-h-[220px]" : "min-h-[160px]"}`}
                        pin={
                            <span className={`absolute left-1/2 top-0 z-10 flex -translate-x-1/2 items-center justify-center rounded-full bg-neutral-700/80 ring-2 ring-white/70 ${wide ? "h-5 w-5" : "h-4 w-4"}`}>
                                <PushPinIcon size={wide ? 11 : 9} weight="fill" className="text-white" />
                            </span>
                        }
                    >
                        <div className={`flex flex-1 flex-col ${wide ? "p-4 pt-7" : "p-2.5 pt-5"}`}>
                            <textarea
                                value={note.text}
                                onChange={(e) => updateNote(note.id, e.target.value)}
                                className={`w-full flex-1 resize-none bg-transparent leading-relaxed text-neutral-800 outline-0 ${wide ? "min-h-[120px] text-sm" : "min-h-[70px] text-xs"}`}
                            />
                            <div className="mt-1.5 flex items-center gap-1">
                                <span className="flex-1 text-[10px] text-neutral-500">{fmtDate(note.updatedAt || note.createdAt)}</span>
                                <span className={`items-center gap-1 ${wide ? "flex" : "hidden group-hover:flex"}`}>
                                    {(wide ? COLORS.slice(0, 4) : COLORS.slice(0, 3)).map((c) => (
                                        <button
                                            key={c}
                                            onClick={() => setColor(note.id, c)}
                                            title="Change color"
                                            className="h-3 w-3 rounded-full border border-black/15"
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </span>
                                <button
                                    onClick={() => deleteNote(note.id)}
                                    title="Delete note"
                                    className="rounded p-1 text-neutral-500 hover:bg-black/10 hover:text-red-600"
                                >
                                    <TrashIcon size={13} />
                                </button>
                            </div>
                        </div>
                    </StickyCard>
                ))}
            </div>

            {visible.length === 0 && (
                <p className="pb-4 text-center text-[11px] text-neutral-500">
                    {query ? "No matching notes." : "No notes yet — write one above."}
                </p>
            )}
        </div>
    );
}

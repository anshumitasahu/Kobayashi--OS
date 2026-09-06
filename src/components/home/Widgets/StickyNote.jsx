import { useEffect, useState } from "react";
import { NoteIcon, CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { loadWidgetSettings, saveWidgetSetting, readNotes } from "../../../lib/Widgets/widgetSettings";

const stop = (e) => e.stopPropagation();

export default function StickyNote() {
    const [notes, setNotes] = useState(readNotes);
    const [pinnedId, setPinnedId] = useState(() => loadWidgetSettings()["sticky-note"] ?? null);

    useEffect(() => {
        const sync = () => setNotes(readNotes());
        window.addEventListener("storage", sync);
        const timer = setInterval(sync, 2000);
        return () => {
            window.removeEventListener("storage", sync);
            clearInterval(timer);
        };
    }, []);

    const pinned = notes.find((n) => n.id === pinnedId) ?? notes[0] ?? null;
    const idx = pinned ? notes.findIndex((n) => n.id === pinned.id) : -1;

    const pick = (id) => {
        setPinnedId(id);
        saveWidgetSetting("sticky-note", id);
    };

    const step = (dir) => {
        if (notes.length === 0) return;
        pick(notes[(idx + dir + notes.length) % notes.length].id);
    };

    const lines = (pinned?.text ?? "").split("\n").filter((l) => l.trim() !== "");
    const title = lines[0] ?? "";
    const preview = lines.slice(1).join("\n");
    const accent = pinned?.color || "#ffd60a";

    return (
        <div className="@container group/note relative w-full h-full min-w-0 min-h-0 overflow-hidden rounded-[26px] bg-white/60 backdrop-blur-2xl border border-white/70 shadow-[0_8px_24px_rgba(0,0,0,0.12)] flex flex-col">
            <div className="flex items-center gap-[2cqw] px-[5cqw] pt-[4cqw] pb-[2cqw]">
                <span className="flex shrink-0 items-center justify-center rounded-[2.2cqw] bg-gradient-to-b from-[#ffe45e] to-[#ffc93c] text-white shadow-[0_2px_6px_rgba(0,0,0,0.15)] w-[clamp(22px,9cqw,32px)] h-[clamp(22px,9cqw,32px)]">
                    <NoteIcon size="60%" weight="fill" />
                </span>
                <p className="min-w-0 flex-1 truncate font-semibold text-neutral-700 text-[clamp(10px,4.4cqw,15px)]">Notes</p>
                <span className="h-[2.4cqw] max-h-[10px] min-h-[6px] w-[2.4cqw] max-w-[10px] min-w-[6px] shrink-0 rounded-full" style={{ backgroundColor: accent }} />
            </div>

            {pinned ? (
                <div className="min-h-0 flex-1 overflow-y-auto px-[5cqw] pb-[4cqw]">
                    <p className="truncate font-semibold tracking-tight text-neutral-900 leading-snug text-[clamp(11px,5cqw,17px)]">
                        {title}
                    </p>
                    {preview && (
                        <p className="mt-[1cqw] whitespace-pre-wrap break-words leading-snug text-neutral-500 text-[clamp(9px,4cqw,13px)]">
                            {preview}
                        </p>
                    )}
                </div>
            ) : (
                <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-[1cqw] px-[5cqw] pb-[5cqw] text-center">
                    <p className="font-semibold text-neutral-500 text-[clamp(9px,4.2cqw,14px)]">No notes yet</p>
                    <p className="text-neutral-400 text-[clamp(8px,3.6cqw,12px)]">Create one in the Notes app</p>
                </div>
            )}

            {notes.length > 1 && (
                <div className="absolute inset-x-0 bottom-[2.5cqw] flex justify-center opacity-0 transition-opacity duration-150 group-hover/note:opacity-100 focus-within:opacity-100">
                    <div className="flex items-center gap-[1.5cqw] rounded-full bg-black/45 px-[2.5cqw] py-[1cqw] text-white backdrop-blur-sm text-[clamp(10px,4cqw,14px)]">
                        <button aria-label="Previous note" onMouseDown={stop} onClick={() => step(-1)} className="flex hover:text-neutral-200">
                            <CaretLeftIcon size="1em" weight="bold" />
                        </button>
                        <span className="font-semibold tabular-nums text-[clamp(8px,3.4cqw,11px)]">
                            {idx + 1} / {notes.length}
                        </span>
                        <button aria-label="Next note" onMouseDown={stop} onClick={() => step(1)} className="flex hover:text-neutral-200">
                            <CaretRightIcon size="1em" weight="bold" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

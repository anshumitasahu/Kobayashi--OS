import { useEffect, useState } from "react";
import { PushPinIcon, CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
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

    return (
        <div
            className="@container group/note relative w-full h-full min-w-0 min-h-0 overflow-hidden rounded-[4px] border border-black/[0.07]"
            style={{ backgroundColor: pinned?.color || "#fef08a", boxShadow: "0 4px 14px rgba(0,0,0,0.18)" }}
        >
            <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[30%] bg-gradient-to-b from-black/[0.07] to-transparent" />
            <span
                aria-hidden="true"
                className="pointer-events-none absolute bottom-0 right-0 h-[clamp(14px,9cqw,26px)] w-[clamp(14px,9cqw,26px)]"
                style={{ backgroundColor: "rgba(0,0,0,0.12)", clipPath: "polygon(100% 0, 0 100%, 100% 100%)" }}
            />
            <span
                aria-hidden="true"
                className="pointer-events-none absolute bottom-0 right-0 h-[clamp(14px,9cqw,26px)] w-[clamp(14px,9cqw,26px)]"
                style={{ backgroundColor: "rgba(255,255,255,0.65)", clipPath: "polygon(100% 5px, 5px 100%, 100% 100%)" }}
            />
            <span className="absolute left-1/2 top-[1.5cqw] -translate-x-1/2 -rotate-6 leading-none text-red-500 drop-shadow-[0_2px_2px_rgba(0,0,0,0.35)] text-[clamp(14px,8cqw,26px)]">
                <PushPinIcon size="1em" weight="fill" />
            </span>

            {pinned ? (
                <p className="absolute inset-0 overflow-y-auto whitespace-pre-wrap break-words leading-snug text-neutral-800 px-[5cqw] pt-[11cqw] pb-[8cqw] text-[clamp(9px,5.2cqw,15px)]">
                    {pinned.text}
                </p>
            ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-[1cqw] px-[5cqw] pt-[8cqw] text-center">
                    <p className="font-semibold text-neutral-600 text-[clamp(9px,4.2cqw,14px)]">No notes yet</p>
                    <p className="text-neutral-500 text-[clamp(8px,3.6cqw,12px)]">Create one in the Notes app</p>
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

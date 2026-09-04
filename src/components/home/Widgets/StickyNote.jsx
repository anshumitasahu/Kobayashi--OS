import { useEffect, useState } from "react";
import { PushPinIcon } from "@phosphor-icons/react";
import { loadWidgetSettings, saveWidgetSetting, readNotes } from "../../../lib/Widgets/widgetSettings";

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

    const pick = (id) => {
        setPinnedId(id);
        saveWidgetSetting("sticky-note", id);
    };

    if (!pinned) {
        return (
            <div className="w-full h-full p-3 flex flex-col items-center justify-center gap-1 rounded-md" style={{ backgroundColor: "#fef08a" }}>
                <PushPinIcon size={18} weight="fill" className="text-neutral-500" />
                <p className="text-xs font-semibold text-neutral-600">No notes yet</p>
                <p className="text-[11px] text-neutral-500">Create one in the Notes app</p>
            </div>
        );
    }

    return (
        <div className="w-full h-full p-2.5 flex flex-col gap-1.5 rounded-md overflow-hidden" style={{ backgroundColor: pinned.color || "#fef08a" }}>
            <div className="flex items-center gap-1">
                <PushPinIcon size={12} weight="fill" className="text-neutral-500 shrink-0" />
                <select
                    value={pinned.id}
                    onChange={(e) => pick(e.target.value)}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="flex-1 min-w-0 bg-transparent text-[11px] font-semibold text-neutral-600 outline-0 cursor-pointer truncate"
                >
                    {notes.map((n) => (
                        <option key={n.id} value={n.id}>
                            {(n.text || "").split("\n")[0].slice(0, 32) || "Untitled"}
                        </option>
                    ))}
                </select>
            </div>
            <p className="flex-1 text-xs leading-relaxed text-neutral-800 whitespace-pre-wrap overflow-y-auto">
                {pinned.text}
            </p>
        </div>
    );
}

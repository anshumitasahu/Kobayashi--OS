import { useMemo } from "react";
import { useAppStore } from "../../../store";
import { AppsInMenu } from "../../../lib/menuApps/menuAppIndex";

const DEFAULT_TILES = ["Browser", "Notes", "Music Player", "Gallery"];
const stop = (e) => e.stopPropagation();

export default function AppShortcuts() {
    const openApp = useAppStore((s) => s.openApp);
    const IconStyle = useAppStore((s) => s.IconStyle);

    const tiles = useMemo(() => {
        const all = AppsInMenu(IconStyle);
        const picked = DEFAULT_TILES.map((name) => all.find((a) => a.name === name)).filter(Boolean);
        for (const app of all) {
            if (picked.length >= 4) break;
            if (!picked.includes(app)) picked.push(app);
        }
        return picked.slice(0, 4);
    }, [IconStyle]);

    return (
        <div className="w-full h-full min-w-0 min-h-0 grid grid-cols-2 grid-rows-2 gap-[6%] p-[4%] bg-transparent">
            {tiles.map((app) => (
                <button
                    key={app.name}
                    title={app.name}
                    onMouseDown={stop}
                    onClick={() => openApp(app)}
                    className="w-full h-full min-w-0 min-h-0 flex items-center justify-center rounded-[26%] bg-white/55 backdrop-blur-2xl border border-white/70 shadow-[0_6px_18px_rgba(0,0,0,0.12)] hover:bg-white/70 active:scale-95 transition overflow-hidden"
                >
                    <img src={app.icon} alt={app.name} className="w-[58%] h-[58%] object-contain pointer-events-none" draggable={false} />
                </button>
            ))}
        </div>
    );
}

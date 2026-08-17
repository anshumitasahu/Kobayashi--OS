import { CalendarIcon, ClockIcon, ListIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { useAppStore } from "../../store";
import { WidgetsStore } from "../../lib/WidgetsStore";

export default function TopBar() {
    const [now, setNow] = useState(new Date())
    const openedWidgets = useAppStore((state) => state.openedWidgets);
    const isWidgetsMenuOpen = useAppStore((state) => state.isWidgetsMenuOpen);
    const toggleWidgetMenu = useAppStore((state) => state.toggleWidgetMenu);


    useEffect(() => {
        const interval = setInterval(() => {
            setNow(new Date());
        }, 1000)

        return () => clearInterval(interval);
    }, [])

    const time = now.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    })

    const date = now.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric"
    })
    return (
        <div>
            <div className="bg-white/50 backdrop-blur-sm h-8 p-2 px-4 flex justify-between w-full border-b border-white text-xs text-gray-700">
                <div>
                    Kobayashi OS
                </div>
                <div className="flex gap-10">
                    <div>{time} {date}</div>
                    <ListIcon onClick={() => toggleWidgetMenu()} />
                </div>
            </div>
            {isWidgetsMenuOpen && (
                <>
                    <div className="top-8.4 right-2 absolute bg-white px-2 py-1 text-sm/7 text-neutral-600 rounded-b-md">
                        {WidgetsStore.map((widget) => (
                            <div
                                key={widget.id}
                                className="flex gap-3 items-center"
                            >
                                <widget.icon />
                                <p>{widget.name}</p>
                            </div>
                        ))}
                    </div></>
            )}
        </div>
    );
}
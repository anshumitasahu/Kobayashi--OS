import { ListIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { useAppStore } from "../../store";
import { WidgetsStore } from "../../lib/WidgetsStore";

export default function TopBar() {
    const [now, setNow] = useState(new Date())

    const openedWidgets = useAppStore((state) => state.openedWidgets);
    const isWidgetsMenuOpen = useAppStore((state) => state.isWidgetsMenuOpen);
    const toggleWidgetMenu = useAppStore((state) => state.toggleWidgetMenu);
    const toggleWidget = useAppStore((state) => state.toggleWidget);


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
        <div className="relative z-50">
            <div className="bg-white/50 backdrop-blur-sm h-8 p-2 px-4 flex justify-between w-full border-b border-white text-xs text-gray-700">
                <div>
                    Kobayashi OS
                </div>

                <div className="flex gap-10">
                    <div>
                        {time} {date}
                    </div>

                    <ListIcon
                        className="cursor-pointer"
                        onClick={toggleWidgetMenu}
                    />
                </div>
            </div>

            {isWidgetsMenuOpen && (
                <div className="absolute top-8 right-2 z-50 bg-white px-2 py-1 text-sm text-neutral-600 rounded-b-md shadow-lg">
                    {WidgetsStore.map((widget) => {
                        const Icon = widget.icon;

                        return (
                            <div
                                key={widget.id}
                                onClick={() => toggleWidget(widget)}
                                className="flex gap-3 items-center cursor-pointer px-2 hover:bg-gray-100"
                            >
                                <Icon />
                                <p>{widget.name}</p>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
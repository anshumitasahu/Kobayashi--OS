import { useEffect, useState } from "react";

export default function TopBar() {
    const [now, setNow] = useState(new Date())

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
                <div>
                    {time} {date}
                </div>
            </div>
        </div>
    );
}
export default function Calendar() {
    const today = new Date();

    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startingDay = (firstDay.getDay() + 6) % 7;

    const days = [];

    for (let i = 0; i < startingDay; i++) {
        days.push(null);
    };
    for (let day = 1; day <= daysInMonth; day++) {
        days.push(day);
    }

    const monthName = today.toLocaleString("default", {
        month: "long",
    })

    const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    return (
        <div className="@container w-full h-full min-w-0 min-h-0">
            <div className="flex flex-col w-full h-full min-h-0 overflow-hidden rounded-[26px] bg-white/60 backdrop-blur-2xl border border-white/70 shadow-[0_8px_24px_rgba(0,0,0,0.12)] px-[5cqw] py-[4cqw]">
                <p className="truncate font-semibold tracking-tight text-neutral-900 leading-tight text-[clamp(12px,6cqw,20px)]">
                    {monthName} <span className="font-medium text-neutral-400">{year}</span>
                </p>
                <div className="grid grid-cols-7 gap-[1cqw] pt-[2cqw] content-start overflow-y-auto">
                    {weekDays.map((day, index) => (
                        <div
                            key={index}
                            className={`font-semibold text-center truncate text-[clamp(7px,3cqw,11px)] ${index === 6 ? "text-[#ff3b30]" : "text-neutral-400"}`}
                        >
                            {day}
                        </div>
                    ))}
                    {days.map((day, index) => {
                        const isToday = day === today.getDate();
                        const isSunday = index % 7 === 6;

                        return (
                            <div
                                key={index}
                                className={`rounded-full aspect-square flex items-center justify-center tabular-nums text-[clamp(7px,3.4cqw,13px)] ${isToday
                                    ? "bg-[#ff3b30] text-white font-semibold shadow-[0_2px_8px_rgba(255,59,48,0.45)]"
                                    : isSunday && day
                                        ? "text-[#ff3b30]"
                                        : "text-neutral-700"
                                    }`}
                            >
                                {day}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

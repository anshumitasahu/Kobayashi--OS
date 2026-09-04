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
        <div className="@container w-full h-full min-w-0 min-h-0 p-1 rounded-md">
            <div className="bg-[#f8f7ff] w-full h-full min-h-0 px-[3cqw] py-[2cqw] rounded-md overflow-y-auto flex flex-col">
                <p className="text-center font-semibold text-neutral-600 leading-tight text-[clamp(11px,5.5cqw,18px)]">{year}-{monthName}</p>
                <div className="grid grid-cols-7 gap-[1.2cqw] p-[1.5cqw] content-start">
                    {weekDays.map((day, index) => (
                        <div
                            key={index}
                            className="font-semibold text-neutral-500 text-center truncate text-[clamp(7px,3.2cqw,12px)]"
                        >
                            {day}
                        </div>
                    ))}
                    {days.map((day, index) => {
                        const isToday = day === today.getDate();

                        return (
                            <div
                                key={index}
                                className="rounded-[0.8cqw] aspect-square flex items-center justify-center text-neutral-700 text-[clamp(7px,3.4cqw,13px)]"
                                style={{
                                    backgroundColor: isToday ? "#beb9e2" : null
                                }}
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

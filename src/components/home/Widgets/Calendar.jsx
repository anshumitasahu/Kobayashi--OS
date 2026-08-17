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
        <div>
            <div className="bg-white/30 w-full px-2 py-1 rounded-md backdrop-blur-lg">
                <p className="text-center text-md font-semibold">{year}-{monthName}</p>
                <div className="grid grid-cols-7 gap-2 p-2">
                    {weekDays.map((day, index) => (
                        <div
                            key={index}
                            className="text-sm font-semibold"
                        >
                            {day}
                        </div>
                    ))}
                    {days.map((day, index) => {
                        const isToday = day === today.getDate();

                        return (
                            <div
                                key={index}
                                className="rounded-sm p-2 text-xs"
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
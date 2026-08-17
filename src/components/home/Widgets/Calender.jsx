export default function Calender() {
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
    console.log(startingDay)
    return (
        <div>
            <div className="bg-white/30 w-full">
                <p >{year}-{monthName}</p>
                <div className="grid grid-cols-7 gap-5  p-2">
                    {weekDays.map((day, index) => (
                        <div key={index}>
                            {day}
                        </div>
                    ))}
                    {days.map((day, index) => {
                        const isToday = day === today.getDate();

                        return (
                            <div
                                key={day}
                                className="rounded-sm p-1"
                                style={{
                                    backgroundColor: isToday ? "#DEDAF4" : null
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
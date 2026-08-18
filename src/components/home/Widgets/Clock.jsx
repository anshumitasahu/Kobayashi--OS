import { useState, useEffect } from "react"

export default function Clock() {
    const [time, setTime] = useState(new Date())

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000)
        return () => clearInterval(timer);
    }, [])
    const now = time.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    })

    const hours = time.getHours();
    const minutes = time.getMinutes();
    const seconds = time.getSeconds();

    const hourAngle = (hours % 12) * 30 + minutes * 0.5;
    const minuteAngle = minutes * 6;
    const secondAngle = seconds * 6;

    return (
        <div>
            <div className="rounded-full w-40 h-40 bg-amber-100 relative ">
                <div
                    className="bg-black w-1 h-10 absolute bottom-[50%] left-[50%] origin-bottom rounded-[50%] -ml-0.75"
                    style={{
                        transform: `rotate(${hourAngle}deg)`
                    }}
                />
                <div
                    className="bg-black w-1 h-15 absolute bottom-[50%] left-[50%] origin-bottom rounded-[50%] -ml-0.75"
                    style={{
                        transform: `rotate(${minuteAngle}deg)`
                    }}
                />
                <div
                    className="bg-black w-0.5 h-15 absolute bottom-[50%] left-[50%] origin-bottom rounded-[50%] -ml-0.75"
                    style={{
                        transform: `rotate(${secondAngle}deg)`
                    }}
                />
                <div
                    className="bg-black w-2 h-2 absolute top-[50%] left-[50%] origin-bottom rounded-full -ml-0.75"
                    style={{
                        transform: 'translate(-50%, -50%)'
                    }}
                />
            </div>
        </div>
    )
}
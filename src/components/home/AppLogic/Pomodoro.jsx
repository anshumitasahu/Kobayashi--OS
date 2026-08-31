import { useState, useRef } from "react"

export default function Pomodoro() {
    const [timeLeft, setTimeLeft] = useState(1500);
    const intervalRef = useRef(null);

    function startTimer() {
        intervalRef.current = setInterval(() => {
            setTimeLeft((prevTimeLeft) => {
                if (prevTimeLeft <= 0) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                    return 0;
                }
                return prevTimeLeft - 1;
            });
        }, 1000);
    };

    function stopTimer() {
        clearInterval(intervalRef.current)
    }

    return (
        <div className="bg-white w-full h-full">
            <h1>Pomodoro Timer</h1>

            <div>
                <span>{String(Math.floor(timeLeft / 60)).padStart(2, "0")}</span>
                <span>:</span>
                <span>{String(Math.floor(timeLeft % 60)).padStart(2, "0")}</span>
            </div>

            <div>
                <button onClick={startTimer}>START</button>
                <button onClick={stopTimer}>STOP</button>
            </div>
        </div>
    )
}
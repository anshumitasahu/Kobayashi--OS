import { useState, useRef, useEffect } from "react"

export default function Pomodoro() {
    const [timeLeft, setTimeLeft] = useState(1500);
    const intervalRef = useRef(null);
    const [isRunning, setIsRunning] = useState(false);

    function startTimer() {
        if (intervalRef.current) return;

        setIsRunning(true);

        intervalRef.current = setInterval(() => {
            setTimeLeft((prevTimeLeft) => {
                if (prevTimeLeft <= 1) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                    setIsRunning(false);
                    return 0;
                }

                return prevTimeLeft - 1;
            });
        }, 1000);
    }

    function stopTimer() {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        setIsRunning(false);
    }

    function resetTimer() {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        setIsRunning(false);
        setTimeLeft(1500);
    }

    useEffect(() => {
        return () => {
            clearInterval(intervalRef.current);
        };
    }, []);

    return (
        <div className="bg-white w-full h-full">
            <h1>Pomodoro Timer</h1>

            <div>
                <span>{String(Math.floor(timeLeft / 60)).padStart(2, "0")}</span>
                <span>:</span>
                <span>{String(timeLeft % 60).padStart(2, "0")}</span>
            </div>

            <div>
                <button onClick={isRunning ? stopTimer : startTimer}>
                    {isRunning ? "PAUSE" : timeLeft === 1500 ? "START" : "RESUME"}
                </button>
                <button onClick={stopTimer}>STOP</button>
                <button onClick={resetTimer}>RESET</button>
            </div>
        </div>
    );
}

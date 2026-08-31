import { ArrowClockwiseIcon, PauseIcon, PlayIcon, TimerIcon } from "@phosphor-icons/react";
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
        <div className="bg-white w-full h-full flex flex-col items-center justify-center">
            <img src="./pomodorTomato.jpg" alt="" className="w-20" />

            <div className="mt-2 mb-3">
                <span className="text-4xl">{String(Math.floor(timeLeft / 60)).padStart(2, "0")}</span>
                <span className="text-4xl">:</span>
                <span className="text-4xl">{String(timeLeft % 60).padStart(2, "0")}</span>
            </div>

            <div className="flex gap-3 justify-center items-center mb-4">
                <TimerIcon className="text-rose-400" />
                <p className="text-neutral-400">Focus Session</p>
            </div>

            <div className="flex gap-3">
                <button
                    onClick={isRunning ? stopTimer : startTimer}
                    className="font-bold"
                >
                    {
                        isRunning ?
                            <div className="border border-rose-400/80 bg-rose-50/60 text-rose-400 font-bold flex gap-3 rounded-xl items-center px-6 py-3">
                                <PauseIcon weight="fill" />
                                <p>Pause</p>
                            </div>
                            : timeLeft === 1500 ?
                                <div className="flex gap-3 px-6 py-3 text-white items-center justify-center bg-rose-400/80 rounded-xl">
                                    <PlayIcon weight="fill" />
                                    <p>Start</p>
                                </div>
                                :
                                <div className="flex gap-3 px-6 py-3 text-white items-center justify-center bg-rose-400/80 rounded-xl">
                                    <PlayIcon weight="fill" />
                                    <p>Resume</p>
                                </div>
                    }
                </button>
                <button
                    onClick={resetTimer}
                    className="border border-neutral-200 px-6 py-3 rounded-xl"
                >
                    <div className="flex items-center justify-center gap-3 text-neutral-600">
                        <ArrowClockwiseIcon />
                        <p>Reset</p>
                    </div>
                </button>
            </div>


        </div>
    );
}

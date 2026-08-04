import { useState, useEffect } from "react";

export default function Calculator() {
    const [display, setDisplay] = useState("")

    const numbers = ["%", "/", 7, 8, 9, "*", 4, 5, 6, "-", 1, 2, 3, "+", "00", 0, "."]

    const handleClick = (value) => {
        setDisplay((prev) => prev + value);
    };

    const handleClear = () => {
        setDisplay("");
    };

    const handleDelete = () => {
        setDisplay((prev) => prev.slice(0, -1));
    };

    const handleEqual = () => {
        try {
            const result = eval(display);
            setDisplay(result.toString());
        } catch {
            setDisplay("Error");
        }
    };

    const handleButtons = numbers.map((number, index) =>
        <button
            onClick={() => handleClick(number)}
            className="font-bold text-gray-500 bg-gray-300/40 rounded-xl px-2 py-4"
            key={index}
        >
            {number}
        </button>
    );

    return (
        <div className="text-black flex flex-col justify-center gap-3 w-full h-full p-3 rounded-xl bg-white">
            <input
                type="text"
                value={display}
                readOnly
                className="border border-gray-400/50 outline-0 px-3 py-6 text-xl rounded-xl"
            />
            <div className="grid grid-cols-4 gap-3">
                <button onClick={handleClear} className="font-bold text-primary bg-gray-300/40 rounded-xl px-2 py-4">C</button>
                <button onClick={handleDelete} className="font-bold text-primary bg-gray-300/40 rounded-xl px-2 py-4">⌫</button>
                {handleButtons}
                <button onClick={handleEqual} className="font-bold bg-primary text-white px-2 py-4 rounded-xl">=</button>
            </div>
        </div >
    );
}
import { useState } from "react";
import { GoogleGenAI } from "@google/genai";
import {
    openAppByName,
    handleSearchWeb,
    handleOpenCalculator,
    handleOpenBrowser,
    handleOpenCamera,
    handleOpenMusic,
    handleOpenYouTube,
    handleOpenGallery,
    handleOpenNotes,
    handleOpenSettings,
    handleOpenTodo,
    handleOpenGames,
    handleOpenFileManager,
    handleOpenShorts,
    handleTakePicture,
    handlePlayMusic,
    handleBrightness,
    handleIncreaseBrightness,
    handleDecreaseBrightness,
    handleWallpaper,
    handleWidgets
} from "../../../lib/AIChats/Capabilities.jsx";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export default function ChatBot() {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!input.trim()) return;
        setLoading(true);

        try {
            const response = await ai.models.generateContent({
                model: "gemini-3.7-flash",
                contents: input,
            });
            setOutput(response.text);
            console.log(response.text)
        } catch (error) {
            console.error("API Error:", error);
            setOutput("Failed to fetch response.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white h-full w-full overflow-scroll flex flex-col justify-between px-4 py-2">
            <div className="space-y-4">
                <div className="flex gap-2">
                    <button
                        onClick={handleIncreaseBrightness}
                        className="px-3 py-1 bg-gray-200 rounded"
                    >
                        Increase Brightness
                    </button>
                </div>

                <div className="p-3 bg-gray-50 border border-gray-200 rounded-md min-h-25">
                    <p className="text-gray-700">
                        {loading ? "Thinking..." : output || "Output will appear here..."}
                    </p>
                </div>
            </div>

            <div className="flex gap-3">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Send a message..."
                    className="border border-neutral-400 px-4 py-2 rounded-md w-full outline-none"
                />
                <button
                    onClick={handleSend}
                    disabled={loading}
                    className="bg-primary px-4 py-2 text-white rounded-md disabled:opacity-50"
                >
                    Send
                </button>
            </div>
        </div>
    );
}
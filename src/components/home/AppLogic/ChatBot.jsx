import { useState } from "react";
import { GoogleGenAI } from "@google/genai";

import {
    openAppByName,
    handleSearchWeb,
    handleTakePicture,
    handlePlayMusic,
    handleBrightness,
    handleIncreaseBrightness,
    handleDecreaseBrightness,
    handleWallpaper,
    handleWidgets,
} from "../../../lib/AIChats/Capabilities.jsx";

import { ChatsCommand } from "../../../lib/AIChats/ChatCommands.jsx";


const ai = new GoogleGenAI({
    apiKey: import.meta.env.VITE_GEMINI_API_KEY,
});


const FunctionRegistry = {
    openAppByName,
    handleSearchWeb,
    handleTakePicture,
    handlePlayMusic,
    handleBrightness,
    handleIncreaseBrightness,
    handleDecreaseBrightness,
    handleWallpaper,
    handleWidgets,
};


async function processCommand(commandData) {
    const { command, params = {} } = commandData;

    const commandDefinition = ChatsCommand.find(
        (item) => item.command === command
    );

    if (!commandDefinition) {
        throw new Error(`Unknown command: ${command}`);
    }

    const fn = FunctionRegistry[commandDefinition.function];

    if (typeof fn !== "function") {
        throw new Error(
            `Function "${commandDefinition.function}" is not registered`
        );
    }

    const args = commandDefinition.params.map(
        (paramName) => params[paramName]
    );

    return await fn(...args);
}


export default function ChatBot() {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [loading, setLoading] = useState(false);


    const handleSend = async () => {
        if (!input.trim() || loading) return;

        setLoading(true);

        try {
            const systemPrompt = `
You are Jarvis, the AI assistant for Kobayashi OS.

You can control Kobayashi OS ONLY through the commands listed below.

Available commands:

${JSON.stringify(ChatsCommand, null, 2)}

IMPORTANT:

1. You may ONLY use commands from this list.
2. Never invent a command.
3. Never execute JavaScript.
4. Never return a function call.
5. Return ONLY JSON.
6. The JSON must have this structure:

{
    "command": "command name",
    "params": {
        "parameterName": "value"
    }
}

For commands with no parameters:

{
    "command": "command name",
    "params": {}
}

If the user's request cannot be handled by one of the available commands:

{
    "command": null,
    "params": {}
}
`;

            const response = await ai.models.generateContent({
                model: "gemini-3.7-flash",
                contents: input,

                config: {
                    systemInstruction: systemPrompt,
                },
            });


            const text = response.text.trim();
            console.log("Gemini response:", text);
            const commandData = JSON.parse(text);
            console.log("command after parse:", commandData);
            if (!commandData.command) {
                setOutput("I don't have a command for that.");
                return;
            }
            const result = await processCommand(commandData);
            console.log("result:", result);
            if (result === true) {
                setOutput(`Executed: ${commandData.command}`);
            } else if (result !== undefined) {
                setOutput(String(result));
            } else {
                setOutput(`Executed: ${commandData.command}`);
            }

        } catch (error) {
            console.error("AI Command Error:", error);

            setOutput(
                error?.message || "Failed to process command."
            );

        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="bg-white h-full w-full overflow-scroll flex flex-col justify-between px-4 py-2">

            <div className="space-y-4">

                <div className="p-3 bg-gray-50 border border-gray-200 rounded-md min-h-25">

                    <p className="text-gray-700">
                        {loading
                            ? "Thinking..."
                            : output || "Output will appear here..."}
                    </p>

                </div>

            </div>

            <div className="flex gap-3">

                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            handleSend();
                        }
                    }}
                    placeholder="Send a message..."
                    className="border border-neutral-400 px-4 py-2 rounded-md w-full outline-none"
                />

                <button
                    onClick={handleSend}
                    disabled={loading}
                    className="bg-primary px-4 py-2 text-white rounded-md disabled:opacity-50"
                >
                    {loading ? "..." : "Send"}
                </button>

            </div>

        </div>
    );
}
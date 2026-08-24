import { useState } from "react";
import { GoogleGenAI } from "@google/genai";

import {
    handleOpenCalculator,
    handleOpenBrowser,
    handleOpenCamera,
    handleSearchWeb,
    handleTakePicture,
    handlePlayMusic,
    handleBrightness,
    handleIncreaseBrightness,
    handleDecreaseBrightness,
    handleWallpaperFromUrl,
    handleWidgets,
    handleOpenGallery,
    handleOpenFileManager,
    handleOpenGames,
    handleOpenSettings,
    handleOpenNotes,
    handleOpenTodo,
    handleOpenShorts,
    handleOpenYouTube,
    handleOpenMusic,
} from "../../../lib/AIChats/Capabilities.jsx";

import { ChatsCommand } from "../../../lib/AIChats/ChatCommands.jsx";


const ai = new GoogleGenAI({
    apiKey: import.meta.env.VITE_GEMINI_API_KEY,
});


const FunctionRegistry = {
    handleOpenCalculator,
    handleOpenBrowser,
    handleOpenCamera,
    handleOpenGallery,
    handleOpenFileManager,
    handleOpenGames,
    handleOpenSettings,
    handleOpenNotes,
    handleOpenTodo,
    handleOpenShorts,
    handleOpenYouTube,
    handleOpenMusic,

    handleTakePicture,

    handleSearchWeb,

    handlePlayMusic,
    handleWallpaperFromUrl,

    handleBrightness,
    handleIncreaseBrightness,
    handleDecreaseBrightness,
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

    function inputProcessor() {
        if (input == "open calculator" || input == "launch calculator") {
            handleOpenCalculator()
            setOutput("Calculator App opened")
            return true;
        }
        if (input == "launch browser" || input == "open browser") {
            handleOpenBrowser()
            setOutput("Browser launched")
            return true;
        }
        if (input === "launch camera" || input == "open camera") {
            handleOpenCamera()
            setOutput("Camera App launched.Allow camera permisson to click photos")
            return true;
        }
        if (input === "launch gallery" || input == "open gallery") {
            handleOpenGallery()
            setOutput("Gallery App Opened")
            return true;
        }
        if (input === "launch file manager" || input == "open file manager") {
            handleOpenFileManager()
            setOutput("File Manager App Opened")
            return true;
        }
        if (input === "open games" || input === "launch games") {
            handleOpenGames()
            setOutput("Chess game launched. Enjoy!!")
            return true;
        }
        if (input === "open settings" || input === "launch settings") {
            handleOpenSettings()
            setOutput("Settings App Opened")
            return true;
        }
        if (input === "open notes" || input === "launch notes") {
            handleOpenNotes()
            setOutput("Notes App Opened")
            return true;
        }
        if (input === "open todos" || input === "launch todos") {
            handleOpenTodo()
            setOutput("ToDos App Opened")
            return true;
        }
        if (input === "open shorts" || input === "launch shorts") {
            handleOpenShorts()
            setOutput("Shorts App Opened")
            return true;
        }
        if (input === "open youTube" || input === "launch youTube") {
            handleOpenYouTube()
            setOutput("YouTube Opened")
            return true;
        }
        if (input === "open music player" || input === "launch music player") {
            handleOpenMusic()
            setOutput("Music player Opened")
            return true;
        }
        if (input === "take my picture" || input === "click my picture" || input === "click my photo" || input === "take my photo" || input === "take photo" || input === "click photo" || input === "take picture" || input === "click picture") {
            handleTakePicture()
            setOutput("picture taken!! A beautiful face detected")
            return true;
        }
        if (input === "play music" || input === "play song" || input === "play a song" || input === "play a music") {
            handlePlayMusic()
            setOutput("Defualt song played!! Change yourself to listen other songs." + " " + "(Info) Default Song: Aozora No Rhapsody- opening theme of Kobayashi OS season-1")
            return true;
        }
        if (input === "show brightness" || input === "what is the brightness level" || input === "show the brightness level") {
            handleBrightness()
            setOutput("brightness showed")
            return true;
        }
        if (input === "increase brightness" || input === "increase the brightness level") {
            handleIncreaseBrightness()
            setOutput("Increased")
            return true;
        }
        if (input === "decrease brightness" || input === "decrease the brightness level") {
            handleDecreaseBrightness()
            setOutput("Decreased")
            return true;
        }
        if (input === "open widgets" || input === "close widgets") {
            handleWidgets()
            setOutput(`widgets opened send "close widgets" to close `)
            return true;
        }
    }

    const handleSend = async () => {
        if (!input.trim() || loading) return;
        setLoading(true);

        try {
            const command = inputProcessor()
            console.log("INPUT:", input);
            console.log("command:", command)
            if (command) {
                setInput("");
                return;
            }
            else {
                const availableCommands = ChatsCommand.map((item) => ({
                    command: item.command,
                    function: item.function,
                    params: item.params,
                }));

                const systemPrompt = `
You are Kobayashi OS AI, an intelligent assistant running inside a web-based operating system.

You are the FALLBACK AI.

IMPORTANT:
There is already a local command processor that handles simple/exact commands before you are called.

You only receive requests that the local command processor could not directly recognize.

Your job is to understand the user's natural-language request and decide whether:

1. It should execute one of the existing Kobayashi OS commands.
2. It is a normal conversational/informational question.

==================================================
AVAILABLE COMMANDS
==================================================

${JSON.stringify(availableCommands, null, 2)}

==================================================
COMMAND RULES
==================================================

If the user wants an OS action and one of the available commands matches their intention:

Return ONLY valid JSON in this exact format:

{
  "type": "command",
  "command": "EXACT_COMMAND_NAME",
  "params": {}
}

Use the EXACT command name from the available command list.

The params object must contain the parameters required by that command.

Never invent a command.
Never invent a function.
Never invent parameters.

Examples:

User:
"Could you launch the calculator?"

Return:
{
  "type": "command",
  "command": "open calculator",
  "params": {}
}

User:
"Can you open my camera?"

Return the appropriate available camera command.

User:
"Make the screen brighter."

Return the appropriate brightness command.

User:
"Open YouTube for me."

Return the appropriate YouTube command.

==================================================
NORMAL CONVERSATION
==================================================

If the user is asking a normal question, asking for an explanation, chatting, or requesting information that does not require an OS action:

Return ONLY valid JSON:

{
  "type": "text",
  "text": "Your concise helpful answer here."
}

Examples:

User:
"What is JavaScript?"

Return:
{
  "type": "text",
  "text": "JavaScript is a programming language commonly used to make websites and web applications interactive."
}

User:
"Tell me about Kobayashi OS."

Return:
{
  "type": "text",
  "text": "Kobayashi OS is a web-based operating-system-style interface with apps and system controls."
}

==================================================
AMBIGUOUS REQUESTS
==================================================

If the user clearly wants an action but you cannot determine which command or required parameter they mean:

Return:

{
  "type": "text",
  "text": "A short clarification question."
}

==================================================
IMPORTANT OUTPUT RULES
==================================================

Your entire response MUST be valid JSON.

Do not use Markdown.

Do not use code fences.

Do not add explanations outside the JSON.

Do not return tool-call syntax.

Do not return JavaScript.

Do not claim that an action was performed.

Only request an action through the command JSON.

==================================================
USER REQUEST
==================================================

${input}
`;

                const response = await ai.models.generateContent({
                    model: "gemini-3.7-flash",
                    contents: input,
                    config: {
                        systemInstruction: systemPrompt,
                        temperature: 0.1,
                        responseMimeType: "application/json",
                    },
                });

                const text = response.text?.trim();

                if (!text) {
                    throw new Error("AI returned an empty response.");
                }

                console.log("Gemini raw response:", text);

                let aiResponse;

                try {
                    aiResponse = JSON.parse(text);
                } catch (parseError) {
                    console.error("Invalid Gemini JSON:", text);

                    setOutput(
                        "Sorry, I couldn't understand that request."
                    );

                    return;
                }

                console.log("Gemini parsed response:", aiResponse);

                if (aiResponse.type === "text") {
                    setOutput(aiResponse.text || "I don't have an answer for that.");
                    return;
                }

                if (aiResponse.type !== "command") {
                    setOutput("I couldn't determine what you want me to do.");
                    return;
                }

                if (!aiResponse.command) {
                    setOutput("I couldn't determine the requested command.");
                    return;
                }

                try {
                    const result = await processCommand({
                        command: aiResponse.command,
                        params: aiResponse.params || {},
                    });

                    console.log("Command result:", result);

                    if (result === true) {
                        setOutput(`Executed: ${aiResponse.command}`);
                    } else if (result !== undefined && result !== null) {
                        setOutput(String(result));
                    } else {
                        setOutput(`Executed: ${aiResponse.command}`);
                    }

                } catch (commandError) {
                    console.error("Command execution error:", commandError);

                    setOutput(
                        commandError?.message ||
                        "I understood the request, but couldn't execute it."
                    );
                }


            }
        } catch (error) {
            console.error("Command Error:", error);
            setOutput(
                error?.message || "Failed to process command."
            );
        }
        finally {
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
                            : output || "Output appears here..."}
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
import { useState } from "react";

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
    handleWallpaper,
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
    handleWallpaper,

    handleBrightness,
    handleIncreaseBrightness,
    handleDecreaseBrightness,
    handleWidgets,
};

function speech(text) {
    const msg = new SpeechSynthesisUtterance(text);

    // 🔻 Lower pitch & slow a bit
    msg.pitch = 1.2;   // (0 to 2) → lower = deeper voice
    msg.rate = 0.9;    // slightly slower

    window.speechSynthesis.speak(msg);
    console.log("speaking", text);
}


async function processCommand(commandData) {
    const { command, params = {} } = commandData;

    const commandDefinition = ChatsCommand.find(
        (item) => item.command === command || item.function === command
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

    const args = (commandDefinition.params || []).map(
        (paramName) => params[paramName]
    );

    return await fn(...args);
}

export default function ChatBot() {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [loading, setLoading] = useState(false);
    const [messageHistory, setMessageHistory] = useState([]);

    function inputProcessor(userInput) {
        const command = userInput.toLowerCase().trim();
        if (command === "open calculator" || command === "launch calculator") {
            handleOpenCalculator();
            setOutput("Calculator App opened");
            return true;
        }
        if (command === "launch browser" || command === "open browser") {
            handleOpenBrowser();
            setOutput("Browser launched");
            return true;
        }
        if (command === "launch camera" || command === "open camera"
        ) {
            handleOpenCamera();
            setOutput("Camera App launched. Allow camera permission to click photos.");
            return true;
        }
        if (command === "launch gallery" || command === "open gallery") {
            handleOpenGallery();
            setOutput("Gallery App Opened");
            return true;
        }
        if (command === "launch file manager" || command === "open file manager") {
            handleOpenFileManager();
            setOutput("File Manager App Opened");
            return true;
        }
        if (command === "open games" || command === "launch games") {
            handleOpenGames();
            setOutput("Chess game launched. Enjoy!!");
            return true;
        }
        if (command === "open settings" || command === "launch settings") {
            handleOpenSettings();
            setOutput("Settings App Opened");
            return true;
        }
        if (command === "open notes" || command === "launch notes") {
            handleOpenNotes();
            setOutput("Notes App Opened");
            return true;
        }
        if (command === "open todos" || command === "launch todos") {
            handleOpenTodo();
            setOutput("ToDos App Opened");
            return true;
        }
        if (command === "open shorts" || command === "launch shorts") {
            handleOpenShorts();
            setOutput("Shorts App Opened");
            return true;
        }
        if (command === "open youtube" || command === "launch youtube") {
            handleOpenYouTube();
            setOutput("YouTube Opened");
            return true;
        }
        if (command === "open music player" || command === "launch music player") {
            handleOpenMusic();
            setOutput("Music player Opened");
            return true;
        }
        if (command === "take my picture" || command === "click my picture" || command === "click my photo" || command === "take my photo" || command === "take photo" || command === "click photo" || command === "take picture" || command === "click picture") {
            handleTakePicture();
            setOutput("Picture taken!! A beautiful face detected.");
            return true;
        }
        if (command === "play music" || command === "play song" || command === "play a song" || command === "play a music") {
            handlePlayMusic();
            setOutput("Default song played!! Change yourself to listen to other songs. " +
                "(Info) Default Song: Aozora No Rhapsody - opening theme of Kobayashi OS season-1");
            return true;
        }
        if (command === "show brightness" || command === "what is the brightness level" || command === "show the brightness level") {
            handleBrightness();
            setOutput("Brightness showed");
            return true;
        }
        if (command === "increase brightness" || command === "increase the brightness level") {
            handleIncreaseBrightness();
            setOutput("Increased");
            return true;
        }
        if (command === "decrease brightness" || command === "decrease the brightness level") {
            handleDecreaseBrightness();
            setOutput("Decreased");
            return true;
        }
        if (command === "open widgets" || command === "close widgets") {
            handleWidgets();
            setOutput('Widgets opened. Send "close widgets" to close.');
            return true;
        }
        if (command === "change wallpaper") {
            handleWallpaper();
            setOutput("Wallpaper Changed");
            return true;
        }
        return false;
    }

    const handleSend = async () => {

        if (!input.trim() || loading) {
            return;
        }
        const userInput = input.trim();
        setLoading(true);
        try {
            const localCommand = inputProcessor(userInput);

            if (localCommand) {
                setInput("");
                return;
            }
            const systemPrompt = `
You are Kobayashi OS AI.

You are an intelligent assistant running inside a web-based operating system.

Your job is to understand the user's request and decide whether:

1. It should execute one of the existing Kobayashi OS commands.
2. It is a normal conversational/informational question.

# AVAILABLE COMMANDS

${JSON.stringify(ChatsCommand, null, 2)}

# OS COMMAND RESPONSE

If the user wants an OS action and one of the available commands matches their intention, return:

{
  "type": "command",
  "command": "EXACT_COMMAND_NAME",
  "params": {}
}

For multiple OS actions, return:

{
  "type": "commands",
  "commands": [
    {
      "command": "EXACT_COMMAND_NAME",
      "params": {}
    },
    {
      "command": "EXACT_COMMAND_NAME",
      "params": {}
    }
  ]
}

The command MUST exactly match one of the available commands.

Never invent commands.

Never invent functions.

Never invent parameters.

If a command requires parameters, use only the parameters defined by that command.

# NORMAL CONVERSATION

If the user is asking a normal question, chatting, or requesting information:

Return ONLY JSON:

{
    "type": "text",
    "text": "Your helpful answer."
}

# AMBIGUOUS REQUESTS

If the user clearly wants an action but you cannot determine the correct command:

Return:

{
    "type": "text",
    "text": "A short clarification question."
}

# IMPORTANT

Your entire response must be valid JSON.

Do not use Markdown.

Do not use code fences.

Do not explain your JSON.

Do not return JavaScript.

Do not claim an action was performed.

If you cant do something , if something is out of your capability the just say "Would you like me to search for <query> for you ?"

# CHAT HISTORY

${JSON.stringify(messageHistory, null, 2)}
`;
            const messages = [
                {
                    role: "system",
                    content: systemPrompt,
                },

                ...messageHistory,

                {
                    role: "user",
                    content: userInput,
                },
            ];
            const response = await fetch(
                "https://openrouter.ai/api/v1/chat/completions",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",

                        "Authorization":
                            `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,

                        "HTTP-Referer":
                            window.location.origin,

                        "X-Title":
                            "Kobayashi OS",
                    },

                    body: JSON.stringify({
                        model: "openrouter/free",
                        messages,
                        temperature: 0.1,
                        response_format: {
                            type: "json_object",
                        },
                    }),
                }
            );
            if (!response.ok) {
                const errorText =
                    await response.text();
                throw new Error(
                    `OpenRouter API error ${response.status}: ${errorText}`
                );
            }
            const data = await response.json();
            console.log("OpenRouter response:", data);
            const text = data?.choices?.[0]?.message?.content?.trim();
            if (!text) {
                throw new Error("OpenRouter returned an empty response.");
            }
            console.log("OpenRouter raw response:", text);
            let aiResponse;
            try {
                aiResponse = JSON.parse(text);
            } catch (parseError) {
                console.error("Invalid OpenRouter JSON:", text);
                setOutput("Sorry, I couldn't understand that request.");
                return;
            }
            console.log("OpenRouter parsed response:", aiResponse);
            if (aiResponse.type === "text") {
                const answer = aiResponse.text || "I don't have an answer for that.";
                setOutput(answer);
                speech(answer);
                setMessageHistory((prev) => [
                    ...prev,
                    {
                        role: "user",
                        content: userInput,
                    },

                    {
                        role: "assistant",
                        content: text,
                    },
                ]);
                return;
            }
            if (aiResponse.type === "commands") {
                for (const command of aiResponse.commands) {
                    await processCommand(command);
                }
                setOutput("Done and dusted!!");
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
                const result =
                    await processCommand({
                        command: aiResponse.command,
                        params: aiResponse.params || {},
                    });
                console.log("Command result:", result);
                if (result === true) {
                    setOutput(`Executed: ${aiResponse.command}`);
                } else if (result !== undefined && result !== null) {
                    result.message
                        ? setOutput(result.message) && speech(result)
                        : setOutput(`${result}`);

                } else {
                    setOutput(`Executed: ${aiResponse.command}`);
                }
                setMessageHistory((prev) => [
                    ...prev,
                    {
                        role: "user",
                        content: userInput,
                    },
                    {
                        role: "assistant",
                        content: text,
                    },
                ]);
            } catch (commandError) {
                console.error("Command execution error:", commandError);
                setOutput(commandError?.message || "I understood the request, but couldn't execute it.");
            }
        } catch (error) {
            console.error("AI Error:", error);
            handleSearchWeb(userInput);
        } finally {
            setLoading(false);
            setInput("");
        }
    };

    return (
        <div className="bg-white h-full w-full overflow-scroll flex flex-col justify-between px-4 py-2">
            <div className="space-y-4">
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-md min-h-25">
                    <p className="text-gray-700">
                        {loading
                            ? "Thinking..."
                            : output ||
                            "Output appears here..."}
                    </p>
                </div>
            </div>
            <div className="flex gap-3">
                <input
                    type="text"
                    value={input}

                    onChange={(e) =>
                        setInput(e.target.value)
                    }

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
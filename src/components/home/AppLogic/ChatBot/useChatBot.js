import { useEffect, useState } from "react";
import { ChatsCommand } from "../../../../lib/AIChats/ChatCommands.jsx";
import { processCommand, toCommandReply } from "../../../../lib/AIChats/commandRunner.js";
import { sendChatCompletion } from "../../../../lib/AIChats/chatService.js";
import { loadMemories, saveMemories } from "../../../../lib/AIChats/memoryStore.js";
import {
    ALL_EMOTIONS,
    DEFAULT_AVATAR_EMOTION,
    DEFAULT_AVATAR_QUOTE,
    VALID_EMOTION_NAMES,
    normalizeEmotion,
} from "../../../../lib/AIChats/emotionUtils.js";
import { buildSystemPrompt } from "../../../../lib/AIChats/kobayashiPrompt.js";
import { runLocalCommand } from "../../../../lib/AIChats/localCommands.js";
import { speak } from "../../../../lib/AIChats/speech.js";
import { handleSearchWeb } from "../../../../lib/AIChats/Capabilities.jsx";
import {
    awardExchange,
    describeRelation,
    getOpening,
    loadRelation,
    syncRelationWithMemories,
} from "../../../../lib/AIChats/relationStore.js";

const LOCAL_EMOTION = "bored";

export const ASSISTANT_ROLE = "kobayashi-chan-ai";

function toApiMessages(history) {
    return history.map((msg) =>
        msg.role === "user"
            ? { role: "user", content: msg.content }
            : { role: "assistant", content: msg.content }
    );
}

function toFallbackReply(commandName) {
    return `Executed: ${commandName ?? "command"}`;
}

export function useChatBot() {
    const [input, setInput] = useState("");
    const [relation, setRelation] = useState(() => loadRelation());
    const [avatarEmotion, setAvatarEmotion] = useState(() => getOpening(loadRelation().level).emotion);
    const [avatarQuote, setAvatarQuote] = useState(() => getOpening(loadRelation().level).quote);
    const [openingKey, setOpeningKey] = useState(0);
    const [loading, setLoading] = useState(false);
    const [messageHistory, setMessageHistory] = useState([]);
    const [memories, setMemories] = useState([]);

    useEffect(() => {
        const handleStorage = (event) => {
            if (event.key && event.key !== "koba-relation") return;
            const next = loadRelation();
            setRelation(next);
            if (messageHistory.length === 0) {
                const opening = getOpening(next.level);
                setAvatarEmotion(opening.emotion);
                setAvatarQuote(opening.quote);
                setOpeningKey((k) => k + 1);
            }
        };
        window.addEventListener("storage", handleStorage);
        return () => window.removeEventListener("storage", handleStorage);
    }, [messageHistory.length]);

    useEffect(() => {
        let cancelled = false;
        loadMemories().then((stored) => {
            if (cancelled) return;
            setMemories(stored);
            const synced = syncRelationWithMemories(stored);
            setRelation(synced);
            const opening = getOpening(synced.level);
            setAvatarEmotion(opening.emotion);
            setAvatarQuote(opening.quote);
        });
        return () => {
            cancelled = true;
        };
    }, []);

    const persistMemories = async (aiResponse, userText) => {
        const facts = aiResponse?.memories_to_store;
        const next = awardExchange(userText, aiResponse);
        setRelation({ xp: next.xp, level: next.level, updatedAt: next.updatedAt });
        if (next.leveledUp) {
            const opening = getOpening(next.level);
            setAvatarEmotion(opening.emotion);
            setAvatarQuote(opening.quote);
        }
        if (!Array.isArray(facts) || facts.length === 0) return;
        const updated = await saveMemories(facts.slice(0, 3));
        setMemories(updated);
        const synced = syncRelationWithMemories(updated);
        setRelation(synced);
    };

    const updateAvatar = (emotion, quote) => {
        const cleanEmotion = normalizeEmotion(emotion);
        const cleanQuote = String(quote || "").trim();
        const looksLikePlaceholder = cleanQuote.startsWith("<") && cleanQuote.endsWith(">");
        const fallback = ALL_EMOTIONS.find((e) => e.emotion === cleanEmotion)?.description;
        setAvatarEmotion(cleanEmotion);
        setAvatarQuote(!cleanQuote || looksLikePlaceholder ? (fallback || DEFAULT_AVATAR_QUOTE) : cleanQuote);
    };

    const pushAssistant = (replyText, emotion, quote) => {
        const cleanEmotion = normalizeEmotion(emotion);
        updateAvatar(cleanEmotion, quote || DEFAULT_AVATAR_QUOTE);
        setMessageHistory((prev) => [
            ...prev,
            { role: ASSISTANT_ROLE, content: replyText, emotion: cleanEmotion },
        ]);
    };

    const handleTextResponse = async (aiResponse, userText) => {
        const answer = aiResponse.text || "I don't have an answer for that.";
        await persistMemories(aiResponse, userText);
        pushAssistant(answer, aiResponse.emotion, aiResponse.avatar_quote);
        speak(answer);
    };

    const handleCommandsResponse = async (aiResponse, userText) => {
        for (const command of aiResponse.commands ?? []) {
            await processCommand(command);
        }
        await persistMemories(aiResponse, userText);
        pushAssistant("Done. Moving on.", aiResponse.emotion, aiResponse.avatar_quote);
    };

    const handleSingleCommandResponse = async (aiResponse, userText) => {
        if (!aiResponse.command) {
            pushAssistant("I couldn't determine the requested command.", aiResponse.emotion, aiResponse.avatar_quote);
            return;
        }
        try {
            const result = await processCommand({
                command: aiResponse.command,
                params: aiResponse.params || {},
            });
            const { reply, speakText } = toCommandReply(result, aiResponse.command);
            if (speakText) speak(speakText);
            await persistMemories(aiResponse, userText);
            pushAssistant(reply, aiResponse.emotion, aiResponse.avatar_quote);
        } catch (commandError) {
            pushAssistant(
                commandError?.message || "It failed. Not my fault. Probably.",
                "sulking",
                "Tch. Try again, I guess."
            );
        }
    };

    const handleAiResponse = async (aiResponse, userText) => {
        if (aiResponse.type === "text") return handleTextResponse(aiResponse, userText);
        if (aiResponse.type === "commands") return handleCommandsResponse(aiResponse, userText);
        if (aiResponse.type !== "command") {
            pushAssistant("I couldn't determine what you want me to do.", aiResponse.emotion, aiResponse.avatar_quote);
            return;
        }
        return handleSingleCommandResponse(aiResponse, userText);
    };

    const handleAiError = (error, userInput) => {
        if (error?.code === "INVALID_JSON_RESPONSE") {
            console.log({error})
            pushAssistant("Sorry, I couldn't understand that request.");
            return;
        }
        handleSearchWeb(userInput);
    };

    const handleSend = async () => {
        const userInput = input.trim();
        if (!userInput || loading) return;

        setInput("");
        setLoading(true);
        setMessageHistory((prev) => [...prev, { role: "user", content: userInput }]);

        try {
            const localReply = runLocalCommand(userInput);
            if (localReply) {
                pushAssistant(localReply, LOCAL_EMOTION, localReply);
                return;
            }

            const systemPrompt = buildSystemPrompt({
                commands: ChatsCommand,
                validEmotions: VALID_EMOTION_NAMES,
                messageHistory: toApiMessages(messageHistory),
                memories,
                relation: describeRelation(relation),
            });

            const aiResponse = await sendChatCompletion([
                { role: "system", content: systemPrompt },
                ...toApiMessages(messageHistory),
                { role: "user", content: userInput },
            ]);

            console.log(aiResponse);

            await handleAiResponse(aiResponse, userInput);
        } catch (error) {
            handleAiError(error, userInput);
        } finally {
            setLoading(false);
        }
    };

    return {
        input,
        setInput,
        avatarEmotion,
        avatarQuote,
        loading,
        messageHistory,
        memories,
        relation: describeRelation(relation),
        openingKey,
        handleSend,
    };
}

export function getDisplayText(msg) {
    if (msg.role === "user") return msg.content;
    try {
        const parsed = JSON.parse(msg.content);
        if (parsed.type === "text" && parsed.text) return parsed.text;
        if (parsed.type === "command") return toFallbackReply(parsed.command);
        if (parsed.type === "commands") return "Done and dusted!!";
        return msg.content;
    } catch {
        return msg.content;
    }
}

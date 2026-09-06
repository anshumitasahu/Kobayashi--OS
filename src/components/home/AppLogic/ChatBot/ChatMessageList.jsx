import { useEffect, useRef } from "react";
import { ArrowCounterClockwise, WarningCircle } from "@phosphor-icons/react";
import { ChatMarkdown } from "./ChatMarkdown.jsx";
import { markdownClass } from "./markdownStyles.js";
import { ASSISTANT_ROLE, getDisplayText } from "./useChatBot.js";

function UserBubble({ message }) {
    return (
        <div className="max-w-[80%] mr-auto bg-white rounded-[24px] rounded-bl-[6px] px-5 py-4 shadow-sm">
            <p className="text-[#ff6faf] font-medium text-[15px] mb-2">You</p>
            <p className="text-[#6b4a5a] text-[15px] leading-snug">{message.content}</p>
        </div>
    );
}

function AssistantBubble({ message }) {
    return (
        <div className="max-w-[80%] ml-auto bg-[#f9c6de] rounded-[24px] rounded-br-[6px] px-6 py-4 shadow-sm">
            <p className="text-[#ff5da8] font-medium text-[15px] mb-2 text-right">
                Kobayashi Chan
            </p>
            <div className={`text-[#6b4a5a] text-left ${markdownClass("")}`}>
                <ChatMarkdown>{getDisplayText(message)}</ChatMarkdown>
            </div>
        </div>
    );
}

function FailedBubble({ message, onRetry, disabled }) {
    return (
        <div className="max-w-[80%] ml-auto bg-[#f9c6de]/60 border border-[#e88cae] rounded-[24px] rounded-br-[6px] px-6 py-4 shadow-sm">
            <p className="text-[#ff5da8] font-medium text-[15px] mb-2 text-right">
                Kobayashi Chan
            </p>
            <div className="flex items-start gap-2 text-[#a03a5e]">
                <WarningCircle size={20} weight="fill" className="shrink-0 mt-0.5" />
                <p className="text-[14px] leading-snug flex-1">{getDisplayText(message)}</p>
                <button
                    onClick={() => onRetry(message)}
                    disabled={disabled}
                    title="Retry"
                    aria-label="Retry message"
                    className="shrink-0 w-8 h-8 rounded-full bg-white hover:bg-[#ffe9f3] active:scale-95 transition flex items-center justify-center text-[#ff5da8] disabled:opacity-50"
                >
                    <ArrowCounterClockwise size={16} weight="bold" />
                </button>
            </div>
        </div>
    );
}

export function ChatMessageList({ messages, onRetry, retryDisabled }) {
    const listRef = useRef(null);

    useEffect(() => {
        const el = listRef.current;
        if (el) el.scrollTop = el.scrollHeight;
    }, [messages]);

    return (
        <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-6 koba-thin-scroll">
            {messages.map((msg, i) => {
                const key = msg.id ?? i;
                if (msg.role === ASSISTANT_ROLE && msg.status === "failed") {
                    return <FailedBubble key={key} message={msg} onRetry={onRetry} disabled={retryDisabled} />;
                }
                return msg.role === ASSISTANT_ROLE ? (
                    <AssistantBubble key={key} message={msg} />
                ) : (
                    <UserBubble key={key} message={msg} />
                );
            })}
        </div>
    );
}

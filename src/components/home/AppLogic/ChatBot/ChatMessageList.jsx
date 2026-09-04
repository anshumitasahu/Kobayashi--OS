import { useEffect, useRef } from "react";
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

export function ChatMessageList({ messages }) {
    const listRef = useRef(null);

    useEffect(() => {
        const el = listRef.current;
        if (el) el.scrollTop = el.scrollHeight;
    }, [messages]);

    return (
        <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-6 koba-thin-scroll">
            {messages.map((msg, i) =>
                msg.role === ASSISTANT_ROLE ? (
                    <AssistantBubble key={i} message={msg} />
                ) : (
                    <UserBubble key={i} message={msg} />
                )
            )}
        </div>
    );
}

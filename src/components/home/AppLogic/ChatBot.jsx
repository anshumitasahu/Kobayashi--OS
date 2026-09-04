import { AvatarCard } from "./ChatBot/AvatarCard.jsx";
import { ChatInput } from "./ChatBot/ChatInput.jsx";
import { ChatMessageList } from "./ChatBot/ChatMessageList.jsx";
import { useChatBot } from "./ChatBot/useChatBot.js";

export default function ChatBot() {
    const {
        input,
        setInput,
        avatarEmotion,
        avatarQuote,
        loading,
        messageHistory,
        handleSend,
    } = useChatBot();

    return (
        <div className="bg-[#ffe9f3] h-full w-full flex flex-col overflow-hidden">
            <ChatMessageList messages={messageHistory} />
            <AvatarCard emotion={avatarEmotion} quote={avatarQuote} loading={loading} />
            <ChatInput
                value={input}
                onChange={setInput}
                onSend={handleSend}
                disabled={loading}
            />
        </div>
    );
}

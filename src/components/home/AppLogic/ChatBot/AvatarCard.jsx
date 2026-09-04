import { getEmotionImage } from "../../../../lib/AIChats/emotionUtils.js";
import { ChatMarkdown } from "./ChatMarkdown.jsx";
import { markdownClass } from "./markdownStyles.js";

export function AvatarCard({ emotion, quote, loading }) {
    return (
        <div className="px-4 pb-2 pt-1 shrink-0">
            <div className="bg-white rounded-[28px] p-4 flex gap-4 shadow-sm max-h-44">
                <img
                    src={getEmotionImage(emotion)}
                    alt={`Kobayashi ${emotion}`}
                    className="w-24 h-24 aspect-square object-cover rounded-2xl shrink-0 bg-[#fde7f1]"
                />
                <div className="flex-1 min-h-0 bg-[#fde7f1] border border-[#eec3d6] rounded-2xl px-4 py-3 overflow-y-auto koba-thin-scroll">
                    <p className="text-[#ff6faf] font-medium text-[15px] mb-2">
                        Kobayashi chan:
                    </p>
                    <div className={`text-[#5f4250] ${markdownClass("")}`}>
                        {loading ? (
                            <p className="text-sm">Thinking...</p>
                        ) : (
                            <ChatMarkdown>{quote}</ChatMarkdown>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

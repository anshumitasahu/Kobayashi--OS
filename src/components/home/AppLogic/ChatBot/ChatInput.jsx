export function ChatInput({ value, onChange, onSend, disabled }) {
    return (
        <div className="px-4 pb-4 pt-1 shrink-0">
            <div className="bg-white rounded-2xl flex items-center pl-5 pr-2 py-2 shadow-sm gap-2">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") onSend();
                    }}
                    placeholder="your text here..."
                    className="flex-1 bg-transparent outline-none text-[#6b4a5a] placeholder:text-[#c9a9b8] text-[15px]"
                />
                <button
                    onClick={onSend}
                    disabled={disabled}
                    className="bg-[#f9a8cc] hover:bg-[#f78fbd] active:scale-95 transition w-16 h-12 rounded-xl flex items-center justify-center text-white disabled:opacity-50 shrink-0"
                >
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3.4 20.4 21.8 12 3.4 3.6l2.6 7.1 9.5 1.3-9.5 1.3-2.6 7.1Z" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

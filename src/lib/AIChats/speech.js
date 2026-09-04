export function speak(text) {
    if (typeof window === "undefined" || !("speechSynthesis" in window) || !text) return;

    const msg = new SpeechSynthesisUtterance(String(text));
    msg.pitch = 1.2;
    msg.rate = 0.9;
    window.speechSynthesis.speak(msg);
}

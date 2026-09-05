import { useState } from "react";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";

const slides = [
    {
        title: "Kobayashi's daily PC",
        description:
            "A tiny desktop in your browser. Apps, widgets and files stay where you left them and work together.",
        image: null,
    },
    {
        title: "Code like Kobayashi",
        description:
            "VS Code, a real terminal, instant run. Write it, break it, run it again.",
        image: "/showcase/code.png",
    },
    {
        title: "Kobayashi-chan is here",
        description:
            "Chat, open apps, change settings. She remembers, reacts, and doesn't mind a little flirting.",
        image: "/showcase/koba-ai.png",
    },
    {
        title: "Office work, sorted",
        description:
            "Word and sheets for docs, numbers and boring business stuff.",
        image: "/showcase/office.png",
    },
    {
        title: "Doodle and jot",
        description:
            "Kanvas for drawing, sticky notes for quick thoughts, todo for keeping track.",
        image: "/showcase/util2.png",
    },
    {
        title: "Little everyday tools",
        description:
            "Pomodoro, weather, color picker, files. Small apps for daily stuff.",
        image: "/showcase/utils.png",
    },
    {
        title: "Widgets + a fast browser",
        description:
            "Drop clocks and notes anywhere, or just ask Kobayashi-chan. Surf with Kobasurf.",
        image: "/showcase/wedgets.png",
    },
    {
        title: "Make it yours",
        description:
            "Wallpapers, videos, icons, widgets. Tweak it all, or tell Kobayashi-chan to do it.",
        image: "/showcase/settings.png",
    },
    {
        title: "Piano is the star",
        description:
            "Learn songs, practice typing, or sneak in a game. You won't get bored here.",
        image: "/showcase/games-piano.png",
    },
    {
        title: "Watch and listen",
        description:
            "YouTube, shorts, streaming and music. Scroll, play, repeat.",
        image: "/showcase/entertainment.png",
    },
];

export default function Welcome({ isInSettings, onDone, fit }) {
    const [index, setIndex] = useState(0);
    const total = slides.length;
    const slide = slides[index];
    const isFirst = index === 0;
    const isLast = index === total - 1;

    const goTo = (i) => setIndex(Math.max(0, Math.min(total - 1, i)));
    const next = () => goTo(index + 1);
    const prev = () => goTo(index - 1);
    const handlePrimary = () => {
        if (!isLast) {
            next();
            return;
        }
        if (onDone) {
            onDone();
            return;
        }
        goTo(0);
    };

    return (
        <div className="h-full w-full flex flex-col bg-white rounded-lg overflow-hidden">
            <div className={fit ? "flex flex-col overflow-hidden" : "flex-1 overflow-y-auto"}>
                {slide.image ? (
                    fit ? (
                        <img
                            key={slide.image}
                            src={slide.image}
                            alt={slide.title}
                            className="w-full aspect-video object-cover object-top block bg-neutral-950"
                            draggable={false}
                        />
                    ) : (
                        <img
                            key={slide.image}
                            src={slide.image}
                            alt={slide.title}
                            className="w-full aspect-video object-cover object-top block"
                            draggable={false}
                        />
                    )
                ) : (
                    fit ? (
                        <div className="w-full aspect-video bg-neutral-950 flex flex-col items-center justify-center gap-2 px-6 text-center">
                            <img src="/logo.svg" alt="Kobayashi OS" className="w-10 h-10" draggable={false} />
                            <p className="text-white text-sm font-medium tracking-tight">
                                Kobayashi OS
                            </p>
                            <p className="text-neutral-500 text-xs">
                                A tiny desktop in your browser.
                            </p>
                        </div>
                    ) : (
                    <div className="w-full aspect-video bg-neutral-950 flex flex-col items-center justify-center gap-2 px-6 text-center">
                        <img src="/logo.svg" alt="Kobayashi OS" className="w-10 h-10" draggable={false} />
                        <p className="text-white text-sm font-medium tracking-tight">
                            Kobayashi OS
                        </p>
                        <p className="text-neutral-500 text-xs">
                            A tiny desktop in your browser.
                        </p>
                    </div>
                    )
                )}

                <div className="px-4 py-3 shrink-0">
                    <div className="flex items-baseline justify-between gap-3">
                        <h1 className="text-sm font-semibold text-neutral-900 tracking-tight truncate">
                            {slide.title}
                        </h1>
                        <span className="shrink-0 text-xs text-neutral-400 tabular-nums">
                            {index + 1}/{total}
                        </span>
                    </div>
                    <p className={fit ? "mt-0.5 text-sm leading-snug text-neutral-500 line-clamp-2 min-h-[2.6em]" : "mt-0.5 text-sm leading-snug text-neutral-500"}>
                        {slide.description}
                    </p>
                </div>
            </div>

            <div className="shrink-0 flex items-center justify-between gap-3 border-t border-gray-100 px-3 py-2.5 bg-white">
                <button
                    onClick={prev}
                    disabled={isFirst}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-600 transition hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-default"
                    aria-label="Previous slide"
                >
                    <CaretLeftIcon size={15} weight="bold" />
                </button>

                <div className="flex items-center gap-1.5">
                    {slides.map((s, i) => (
                        <button
                            key={s.title}
                            onClick={() => goTo(i)}
                            aria-label={`Go to slide ${i + 1}`}
                            className={`h-1.5 rounded-full transition-all cursor-pointer ${i === index ? "w-5 bg-neutral-900" : "w-1.5 bg-neutral-200 hover:bg-neutral-300"
                                }`}
                        />
                    ))}
                </div>

                <button
                    onClick={handlePrimary}
                    className="flex h-7 items-center gap-1 rounded-full bg-neutral-900 px-3.5 text-sm font-medium text-white transition hover:bg-neutral-700 cursor-pointer"
                >
                    {isLast ? "Done" : "Next"}
                    {!isLast && <CaretRightIcon size={13} weight="bold" />}
                </button>
            </div>
        </div>
    );
}

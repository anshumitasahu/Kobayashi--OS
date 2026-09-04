import {
    PauseIcon,
    PlayIcon,
    RepeatIcon,
    RepeatOnceIcon,
    ShuffleIcon,
    SkipBackIcon,
    SkipForwardIcon
} from "@phosphor-icons/react";
import { useState, useRef, useEffect } from "react";
import { MusicIndex } from "../../../lib/Music/MusicIndex";

export default function MusicPlayer({ autoPlay = false }) {
    const audioRef = useRef(null);
    const canvasRef = useRef(null);
    const audioCtxRef = useRef(null);
    const analyserRef = useRef(null);
    const sourceRef = useRef(null);
    const rafRef = useRef(null);
    const autoPlayNextRef = useRef(false);
    const isPlayingRef = useRef(false);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [repeatOne, setRepeatOne] = useState(false);
    const [loopAll, setLoopAll] = useState(true);
    const [shuffle, setShuffle] = useState(false);

    const currentSong = MusicIndex[currentIndex];

    useEffect(() => {
        isPlayingRef.current = isPlaying;
    }, [isPlaying]);

    const ensureAudioGraph = () => {
        if (!audioRef.current) return false;

        if (!audioCtxRef.current) {
            const Ctx = window.AudioContext || window.webkitAudioContext;
            if (!Ctx) return false;
            audioCtxRef.current = new Ctx();
        }

        if (audioCtxRef.current.state === "suspended") {
            audioCtxRef.current.resume();
        }

        if (!sourceRef.current) {
            sourceRef.current = audioCtxRef.current.createMediaElementSource(audioRef.current);
            analyserRef.current = audioCtxRef.current.createAnalyser();
            analyserRef.current.fftSize = 128;
            analyserRef.current.smoothingTimeConstant = 0.8;
            sourceRef.current.connect(analyserRef.current);
            analyserRef.current.connect(audioCtxRef.current.destination);
        }

        return true;
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");

        const resize = () => {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = canvas.clientWidth * dpr;
            canvas.height = canvas.clientHeight * dpr;
        };
        resize();
        window.addEventListener("resize", resize);

        const BAR_COUNT = 16;
        const data = new Uint8Array(64);

        const draw = () => {
            rafRef.current = requestAnimationFrame(draw);
            const { width, height } = canvas;
            ctx.clearRect(0, 0, width, height);
            if (!analyserRef.current || !isPlayingRef.current) return;

            analyserRef.current.getByteFrequencyData(data);
            const barWidth = width / BAR_COUNT;
            const gap = barWidth * 0.25;

            for (let i = 0; i < BAR_COUNT; i++) {
                const value = data[Math.floor((i / BAR_COUNT) * data.length)] / 255;
                const barHeight = Math.max(2, value * height * 0.9);
                const gradient = ctx.createLinearGradient(0, height, 0, 0);
                gradient.addColorStop(0, "rgba(253, 164, 175, 0.9)");
                gradient.addColorStop(1, "rgba(244, 114, 182, 0.9)");
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.roundRect(
                    i * barWidth + gap / 2,
                    height - barHeight,
                    barWidth - gap,
                    barHeight,
                    [4, 4, 0, 0]
                );
                ctx.fill();
            }
        };
        rafRef.current = requestAnimationFrame(draw);

        return () => {
            cancelAnimationFrame(rafRef.current);
            window.removeEventListener("resize", resize);
        };
    }, []);

    useEffect(() => {
        if (!autoPlay || !audioRef.current) return;

        const playAudio = async () => {
            try {
                ensureAudioGraph();
                await audioRef.current.play();
                setIsPlaying(true);
            } catch (error) {
                console.error("Could not autoplay music:", error);
            }
        };

        playAudio();
    }, [autoPlay]);

    useEffect(() => {
        if (autoPlayNextRef.current && audioRef.current) {
            autoPlayNextRef.current = false;
            ensureAudioGraph();
            audioRef.current.play().then(() => setIsPlaying(true)).catch((error) => {
                console.error("Could not play next track:", error);
                setIsPlaying(false);
            });
        }
    }, [currentIndex]);

    const setPlaying = (value) => {
        isPlayingRef.current = value;
        setIsPlaying(value);
    };

    const goTo = (index, autoplay = isPlayingRef.current) => {
        autoPlayNextRef.current = autoplay;
        setCurrentIndex(index);
        setProgress(0);
        if (!autoplay) setPlaying(false);
    };

    const handlePlay = async () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
            setPlaying(false);
        } else {
            try {
                ensureAudioGraph();
                await audioRef.current.play();
                setPlaying(true);
            } catch (error) {
                console.error("Could not play music:", error);
            }
        }
    };

    const handlePrevious = () => {
        goTo(currentIndex === 0 ? MusicIndex.length - 1 : currentIndex - 1);
    };

    const handleNext = () => {
        goTo(currentIndex === MusicIndex.length - 1 ? 0 : currentIndex + 1);
    };

    const handleTimeUpdate = () => {
        if (!audioRef.current) return;

        const currentTime = audioRef.current.currentTime;
        const duration = audioRef.current.duration;

        if (duration) {
            setProgress((currentTime / duration) * 100);
        }
    };

    const handleSeek = (e) => {
        if (!audioRef.current) return;

        const value = Number(e.target.value);
        const duration = audioRef.current.duration;

        audioRef.current.currentTime = (value / 100) * duration;
        setProgress(value);
    };

    const handleEnded = () => {
        if (repeatOne) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch((error) => {
                console.error("Could not repeat track:", error);
            });
            return;
        }

        if (shuffle) {
            let next = currentIndex;
            if (MusicIndex.length > 1) {
                while (next === currentIndex) {
                    next = Math.floor(Math.random() * MusicIndex.length);
                }
            }
            goTo(next, true);
            return;
        }

        if (currentIndex === MusicIndex.length - 1) {
            if (loopAll) {
                goTo(0, true);
            } else {
                setPlaying(false);
                setProgress(0);
            }
        } else {
            goTo(currentIndex + 1, true);
        }
    };

    const modeButtonClass = (active) =>
        `p-1.5 rounded-full transition-all duration-200 active:scale-95 ${active ? "text-rose-300 bg-white/10" : "text-white/50 hover:text-white hover:bg-black/10"}`;

    return (
        <div
            className="relative shadow-sm w-full h-full p-4"
            style={{
                backgroundImage: `url(${currentSong.ThumbNail})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                borderRadius: "16px"
            }}
        >
            <div className="absolute inset-0 bg-black/10 backdrop-blur-md flex flex-col items-center justify-center border border-pink-100 rounded-2xl">
                <div className="flex flex-col items-center">
                    <div className="relative">
                        <img
                            src={currentSong.ThumbNail}
                            className="w-55 h-52 object-cover rounded-xl shadow-xs"
                            alt={currentSong.name}
                        />
                        <canvas
                            ref={canvasRef}
                            className="absolute inset-0 w-full h-full rounded-xl pointer-events-none"
                        />
                    </div>

                    <h2 className="mt-3 font-semibold text-white text-lg">{currentSong.name}</h2>

                    <p className="text-xs text-white/80 bg-neutral-600/30 py-1 px-2 rounded-4xl font-medium">{currentSong.artist}</p>
                </div>

                <audio
                    ref={audioRef}
                    src={currentSong.Music}
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={handleEnded}
                />

                <div className="mt-5 flex flex-col gap-3 w-full px-2">
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => setRepeatOne((v) => !v)}
                            title="Repeat one"
                            className={modeButtonClass(repeatOne)}
                        >
                            <RepeatOnceIcon size={18} weight={repeatOne ? "fill" : "regular"} />
                        </button>

                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={progress}
                            onChange={handleSeek}
                            className="flex-1 accent-pink-300 h-1.5 bg-pink-100 rounded-lg cursor-pointer"
                        />

                        <button
                            onClick={() => setLoopAll((v) => !v)}
                            title="Loop all"
                            className={modeButtonClass(loopAll)}
                        >
                            <RepeatIcon size={18} weight={loopAll ? "fill" : "regular"} />
                        </button>

                        <button
                            onClick={() => setShuffle((v) => !v)}
                            title="Shuffle"
                            className={modeButtonClass(shuffle)}
                        >
                            <ShuffleIcon size={18} weight={shuffle ? "fill" : "regular"} />
                        </button>
                    </div>

                    <div className="flex justify-center items-center gap-4 mt-2">
                        <button
                            onClick={handlePrevious}
                            className="p-2.5 rounded-full text-white hover:bg-black/10 active:scale-95 transition-all duration-200 shadow-xs"
                        >
                            <SkipBackIcon size={24} weight="fill" />
                        </button>

                        <button
                            onClick={handlePlay}
                            className="p-3.5 rounded-full bg-rose-300 text-white hover:bg-rose-400 active:scale-95 transition-all duration-200 shadow-sm"
                        >
                            {isPlaying ? (
                                <PauseIcon size={30} weight="fill" />
                            ) : (
                                <PlayIcon size={30} weight="fill" />
                            )}
                        </button>

                        <button
                            onClick={handleNext}
                            className="p-2.5 rounded-full text-white hover:bg-black/10 active:scale-95 transition-all duration-200 shadow-xs"
                        >
                            <SkipForwardIcon size={24} weight="fill" />
                        </button>
                    </div>
                    <p className="text-xs bg-black/20 py-1 px-2 rounded-sm text-neutral-200 font-medium text-center">{currentSong.description}</p>
                </div>
            </div>
        </div >
    );
}

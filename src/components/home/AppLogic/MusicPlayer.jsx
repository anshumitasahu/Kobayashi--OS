import {
    PauseIcon,
    PlayIcon,
    SkipBackIcon,
    SkipForwardIcon
} from "@phosphor-icons/react";
import { useState, useRef, useEffect } from "react";
import { MusicIndex } from "../../../lib/Music/MusicIndex";

export default function MusicPlayer({ autoPlay = false }) {
    const audioRef = useRef(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [progress, setProgress] = useState(0);

    const currentSong = MusicIndex[currentIndex];

    useEffect(() => {
        if (!autoPlay || !audioRef.current) return;

        const playAudio = async () => {
            try {
                await audioRef.current.play();
                setIsPlaying(true);
            } catch (error) {
                console.error("Could not autoplay music:", error);
            }
        };

        playAudio();
    }, [autoPlay]);

    const handlePlay = async () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            try {
                await audioRef.current.play();
                setIsPlaying(true);
            } catch (error) {
                console.error("Could not play music:", error);
            }
        }
    };

    const handlePrevious = () => {
        setCurrentIndex((prev) =>
            prev === 0 ? MusicIndex.length - 1 : prev - 1
        );
        setIsPlaying(false);
        setProgress(0);
    };

    const handleNext = () => {
        setCurrentIndex((prev) =>
            prev === MusicIndex.length - 1 ? 0 : prev + 1
        );
        setIsPlaying(false);
        setProgress(0);
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
        handleNext();
    };

    return (
        <div className="bg-pink-50/60 border border-pink-100 shadow-sm w-full h-full p-4 rounded-2xl">
            <div className="flex flex-col items-center">
                <img
                    src={currentSong.ThumbNail}
                    className="w-full h-52 object-cover rounded-xl shadow-xs"
                    alt={currentSong.name}
                />

                <h2 className="mt-3 font-semibold text-rose-950 text-lg">{currentSong.name}</h2>

                <p className="text-xs text-rose-400 font-medium">{currentSong.description}</p>
            </div>

            <audio
                ref={audioRef}
                src={currentSong.Music}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleEnded}
            />

            <div className="mt-5 flex flex-col gap-3">
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={handleSeek}
                    className="accent-pink-300 h-1.5 bg-pink-100 rounded-lg cursor-pointer"
                />

                {/* Aesthetic Pastel Button Controls */}
                <div className="flex justify-center items-center gap-4 mt-2">
                    <button
                        onClick={handlePrevious}
                        className="p-2.5 rounded-full bg-purple-200 text-purple-600 hover:bg-purple-300 active:scale-95 transition-all duration-200 shadow-xs"
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
                        className="p-2.5 rounded-full bg-purple-200 text-purple-600 hover:bg-purple-300 active:scale-95 transition-all duration-200 shadow-xs"
                    >
                        <SkipForwardIcon size={24} weight="fill" />
                    </button>
                </div>
            </div>
        </div>
    );
}
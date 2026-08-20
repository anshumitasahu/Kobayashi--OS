import { PauseIcon, PlayIcon, SkipBackIcon, SkipForwardIcon } from "@phosphor-icons/react";
import { useState, useRef } from "react";
import { MusicIndex } from "../../../lib/Music/MusicIndex";

export default function MusicPlayer() {
    const audioRef = useRef(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [progress, setProgress] = useState(0);

    const currentSong = MusicIndex[currentIndex];


    const handlePlay = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play();
            setIsPlaying(true);
        }
    }

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
        <div>
            <div>
                <img src={currentSong.ThumbNail} alt="" />
                <h2>
                    {currentSong.name}
                </h2>
                <p>
                    {currentSong.description}
                </p>
            </div>
            <audio
                src={currentSong.Music}
                ref={audioRef}
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
                    style={{
                        transition: "all 200"
                    }}
                />
                <div className="flex justify-around">
                    <button onClick={handlePrevious}>
                        <SkipBackIcon size={40} className="bg-pink-400 rounded-full p-2 text-black" />
                    </button>
                    <button onClick={handlePlay}>
                        {isPlaying ? <PauseIcon size={40} className="bg-pink-400 rounded-full p-2 text-black" /> : <PlayIcon size={40} className="bg-pink-400 rounded-full p-2 text-black" />}
                    </button>
                    <button onClick={handleNext}>
                        <SkipForwardIcon size={40} className="bg-pink-400 rounded-full p-2 text-black" />
                    </button>
                </div>
            </div>
        </div>
    )
}
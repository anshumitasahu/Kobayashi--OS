import { useRef, useState } from "react";

export default function YouTube() {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const handlePlay = () => {
        setIsPlaying(true)
    }

    const handlePause = () => {
        setIsPlaying(false)
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-5">
                <img src="./colloid/youtube.svg" alt="YouTube" className="w-8" />
                <p>YouTube.com</p>
            </div>

            <div className="flex flex-col gap-4">
                <div className="flex gap-3">
                    <video
                        ref={videoRef}
                        src="./kobayashi-os-demo-1.mp4"
                        controls
                        className="w-70"
                        onPlay={handlePlay}
                        onPause={handlePause}
                    />

                    <div>
                        <p>Kobayashi OS Demo of v-1</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <video src="./kobayashi-os-demo-1.mp4" controls className="w-70" />
                    <p>Kobayashi OS Demo of v-1</p>
                </div>
            </div>
        </div>
    );
}

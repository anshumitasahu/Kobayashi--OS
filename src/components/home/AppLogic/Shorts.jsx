import { useEffect, useRef, useState } from "react";

export default function Shorts() {
    const [playing, setPlaying] = useState(null);
    const videosRef = useRef([]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const index = Number(entry.target.dataset.index);

                    if (entry.isIntersecting) {
                        videosRef.current.forEach((video, i) => {
                            if (i !== index) {
                                video?.pause();
                            }
                        });

                        entry.target.play();
                        setPlaying(index);
                    } else {
                        entry.target.pause();
                    }
                });
            },
            { threshold: 0.7 }
        );

        videosRef.current.forEach((video) => {
            if (video) observer.observe(video);
        });

        return () => observer.disconnect();
    }, []);

    return (
        <div className="w-full h-full overflow-y-scroll snap-y snap-mandatory">
            {[1, 2].map((_, index) => (
                <div
                    key={index}
                    className="w-full h-full snap-start"
                >
                    <video
                        ref={(el) => {
                            videosRef.current[index] = el;
                        }}
                        data-index={index}
                        src="/kobayashi-os-demo-1.mp4"
                        className="w-full h-full object-cover"
                        controls
                        playsInline
                    />
                </div>
            ))}
        </div>
    );
}

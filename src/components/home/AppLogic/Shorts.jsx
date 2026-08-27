import { useEffect, useRef } from "react";

const videos = [
    "U4yM3Ilu4Og",
    "DG--Ubbq5MU",
    "7rvmOWlvJHI",
    "68L0G7c3cLk",
    "57_RLMhmpJA",
];
export default function Shorts() {
    const iframesRef = useRef([]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const iframe = entry.target;

                    if (entry.isIntersecting) {
                        iframesRef.current.forEach((el) => {
                            if (el && el !== iframe) {
                                el.contentWindow?.postMessage(
                                    JSON.stringify({
                                        event: "command",
                                        func: "pauseVideo",
                                        args: [],
                                    }),
                                    "*"
                                );
                            }
                        });

                        iframe.contentWindow?.postMessage(
                            JSON.stringify({
                                event: "command",
                                func: "playVideo",
                                args: [],
                            }),
                            "*"
                        );
                    } else {
                        iframe.contentWindow?.postMessage(
                            JSON.stringify({
                                event: "command",
                                func: "pauseVideo",
                                args: [],
                            }),
                            "*"
                        );
                    }
                });
            },
            { threshold: 0.7 }
        );

        iframesRef.current.forEach((iframe) => {
            if (iframe) observer.observe(iframe);
        });

        return () => observer.disconnect();
    }, []);

    return (
        <div className="w-full h-full overflow-y-scroll snap-y snap-mandatory">
            {videos.map((videoId, index) => (
                <div
                    key={videoId}
                    className="w-full h-full snap-start"
                >
                    <iframe
                        ref={(el) => {
                            iframesRef.current[index] = el;
                        }}
                        className="w-full h-full"
                        src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=0&mute=1&playsinline=1&controls=1&rel=0`}
                        title={`YouTube Short ${index + 1}`}
                        allow="autoplay; encrypted-media; picture-in-picture"
                        allowFullScreen
                    />
                </div>
            ))}
        </div>
    );
}

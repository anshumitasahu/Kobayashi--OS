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
    const containerRef = useRef(null);
    const infiniteVideos = [
        videos[videos.length - 1],
        ...videos,
        videos[0],
    ];

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        const observer = new IntersectionObserver((entries) => {
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
        container.scrollTop = container.clientHeight;

        const handleScroll = () => {
            const height = container.clientHeight;
            const index = Math.round(container.scrollTop / height);

            if (index === infiniteVideos.length - 1) {
                setTimeout(() => {
                    container.style.scrollBehavior = "auto";
                    container.scrollTop = height;
                    container.style.scrollBehavior = "";
                }, 50);
            }
            if (index === 0) {
                setTimeout(() => {
                    container.style.scrollBehavior = "auto";
                    container.scrollTop =
                        height * videos.length;
                    container.style.scrollBehavior = "";
                }, 50);
            }
        };

        container.addEventListener("scroll", handleScroll);

        return () => {
            observer.disconnect();
            container.removeEventListener("scroll", handleScroll);
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="w-full h-full overflow-y-scroll snap-y snap-mandatory"
        >
            {infiniteVideos.map((videoId, index) => (
                <div
                    key={`${videoId}-${index}`}
                    className="w-full h-full snap-start snap-always"
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
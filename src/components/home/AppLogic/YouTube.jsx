export default function YouTube() {
    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-5">
                <img
                    src="./colloid/youtube.svg"
                    alt="YouTube"
                    className="w-8 h-8"
                />
                <p className="text-sm text-gray-600">YouTube.com</p>
            </div>

            <div className="grid grid-cols-3 gap-5">
                <div className="min-w-0 w-full">
                    <iframe
                        width="100%"
                        src="https://www.youtube.com/embed/-u3vE84Wo_U"
                        title="YouTube video player"
                        className="block w-full aspect-video rounded-xl border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                    />
                </div>

                <div className="min-w-0 w-full">
                    <iframe
                        width="100%"
                        src="https://www.youtube.com/embed/jVx-vCjU_DE"
                        title="YouTube video player"
                        className="block w-full aspect-video rounded-xl border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                    />
                </div>

                <div className="min-w-0 w-full">
                    <iframe
                        width="100%"
                        src="https://www.youtube.com/embed/mxHoPYFsTuk"
                        title="YouTube video player"
                        className="block w-full aspect-video rounded-xl border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                    />
                </div>

                <div className="min-w-0 w-full">
                    <iframe
                        width="100%"
                        src="https://www.youtube.com/embed/b9eMGE7QtTk?si=nIfa9s71n4teyqNG"
                        title="YouTube video player"
                        frameborder="0"
                        className="block w-full aspect-video rounded-xl border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerpolicy="strict-origin-when-cross-origin"
                        allowfullscreen />
                </div>
                <div className="min-w-0 w-full">
                    <iframe width="100%"
                        src="https://www.youtube.com/embed/dL1htoxiQLY?si=teM7uWPSO1zDULFW"
                        title="YouTube video player"
                        frameborder="0"
                        className="block w-full aspect-video rounded-xl border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerpolicy="strict-origin-when-cross-origin"
                        allowfullscreen />
                </div>
                <div className="min-w-0 w-full">
                    <iframe width="100%"
                        src="https://www.youtube.com/embed/AYO4qHAnLQI?si=Nh8Sncc0GSbrwobl"
                        title="YouTube video player"
                        frameborder="0"
                        className="block w-full aspect-video rounded-xl border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerpolicy="strict-origin-when-cross-origin"
                        allowfullscreen />
                </div>
            </div>
        </div>
    );
}

import { useAppStore } from "../../../../store";

export default function Wallpaper() {
    const Wallpaper = [
        "bg2.png",
        "bg.png",
        "bg.jpeg",
        "bg-5.jpg",
        "bg-6.jpg",
        "bg-n.png",
        "bg-1.png",
        "bg-new.webp"
    ]

    const setWallpaper = useAppStore((state) => state.setWallpaper)

    return (
        <div className="overflow-scroll h-100 px-2 bg-white/70 rounded-md">
            <h1 className="text-md mt-2 mb-4">
                Appearance
            </h1>
            <div>
                <h2 className="mb-3 mt-1 text-sm">
                    Wallpapers
                </h2>
                <div className="grid grid-cols-2 gap-3">
                    {Wallpaper.map((Wallpaper) => (
                        <img src={Wallpaper} key={Wallpaper} alt="" onClick={() => setWallpaper(Wallpaper)} className="rounded hover:scale-103 transition" />
                    ))}
                </div>
            </div>
        </div>
    )
}
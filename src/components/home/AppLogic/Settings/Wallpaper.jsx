import { useAppStore } from "../../../../store";

export default function Wallpaper() {
    const Wallpaper = [
        "bg3.jpg",
        "bg2.png",
        "bg1.jpg",
        "bg.png",
        "hero.jpg",
        "bg.jpeg",
        "bg-5.jpg",
        "bg-6.jpg"
    ]

    const setWallpaper = useAppStore((state) => state.setWallpaper)

    return (
        <div className="overflow-scroll px-2 bg-white/70 rounded-md">
            <div>
                <h1 className="mb-3 mt-1 text-sm">
                    Wallpapers
                </h1>
                <div className="flex flex-wrap gap-2">
                    {Wallpaper.map((Wallpaper) => (
                        <img src={Wallpaper} key={Wallpaper} alt="" onClick={() => setWallpaper(Wallpaper)} className="w-40 h-auto rounded hover:scale-103 transition" />
                    ))}
                </div>
            </div>
            {/* <div>
                <h1>
                    Choose Theme:
                </h1>
                <div className="flex gap-2">
                    <div className="bg-black h-5 w-5 rounded-full"></div>
                    <div className="bg-green-500 w-5 h-5 rounded-full"></div>
                    <div className="bg-primary w-5 h-5 rounded-full"></div>
                </div>
            </div> */}
        </div>
    )
}
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { useAppStore } from "../../../store";

export default function Settings() {
    const Wallpaper = [
        "bg-4.jpeg",
        "bg3.jpg",
        "bg2.png",
        "bg2.jpeg",
        "bg1.jpg",
        "bg.png",
        "hero.jpg",
        "bg.jpeg",
        "bg-5.jpg",
        "bg-6.jpg"
    ]

    const setWallpaper = useAppStore((state) => state.setWallpaper)

    return (
        <div className="h-100 w-130 overflow-scroll p-3">
            <div className="flex items-center gap-3 mt-1 mb-1">
                <input type="text" placeholder="Search here" />
                <button>
                    <MagnifyingGlassIcon size={20} />
                </button>
            </div>
            <div>
                <h1>
                    Choose Wallpapers:
                </h1>
                <div className="flex flex-wrap gap-2">
                    {/* <img src="/bg-4.jpeg" alt="" className="w-40 h-auto" />
                    <img src="/bg3.jpg" alt="" className="w-40 h-auto" />
                    <img src="/bg2.png" alt="" className="w-40 h-auto" /> */}
                    {Wallpaper.map((Wallpaper) => (
                        <img src={Wallpaper} key={Wallpaper} alt="" onClick={() => setWallpaper(Wallpaper)} className="w-40 h-auto" />
                    ))}
                </div>
            </div>
        </div>
    )
}
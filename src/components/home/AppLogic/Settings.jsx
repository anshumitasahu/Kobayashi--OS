import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { useAppStore } from "../../../store";

export default function Settings() {
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
        <div className="h-100 w-130 overflow-scroll p-3">
            <div className="flex items-center gap-3 mt-1 mb-1 w-full bg-white/10 rounded-md border border-black/20 px-2 py-1">
                <input type="text" placeholder="Search here" className="w-full outline-0" />
                <button>
                    <MagnifyingGlassIcon size={20} color="black" />
                </button>
            </div>
            <div>
                <h1 className="mb-1 mt-2">
                    Choose Wallpapers:
                </h1>
                <div className="flex flex-wrap gap-2">
                    {Wallpaper.map((Wallpaper) => (
                        <img src={Wallpaper} key={Wallpaper} alt="" onClick={() => setWallpaper(Wallpaper)} className="w-40 h-auto rounded hover:scale-103 transition" />
                    ))}
                </div>
            </div>
            <div>
                <h1>
                    Choose Theme:
                </h1>
                <div className="flex gap-2">
                    <div className="bg-black h-5 w-5 rounded-full"></div>
                    <div className="bg-green-500 w-5 h-5 rounded-full"></div>
                    <div className="bg-primary w-5 h-5 rounded-full"></div>
                </div>
            </div>
        </div>
    )
}
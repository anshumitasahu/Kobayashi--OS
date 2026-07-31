import { useState, useEffect } from "react";
import { useAppStore } from "../../../../store";

export default function Wallpaper() {

    const setWallpaper = useAppStore((state) => state.setWallpaper);

    const wallpapers = [
        "bg2.png",
        "bg.png",
        "bg-6.jpg",
        "bg-n.png",
        "bg-1.png",
        "bg-new.jpeg"
    ]

    return (
        <div className="overflow-scroll h-100 px-2 bg-white/70 rounded-md">
            <h1 className="text-md mt-2 mb-4 font-semibold">
                Appearance
            </h1>
            <div className="mb-3">
                <h2 className="mb-3 mt-1 text-sm text-gray-600">
                    Wallpaper
                </h2>
                <div className="grid grid-cols-2 gap-3">
                    {wallpapers.map((wallpaper) => (
                        <img
                            src={wallpaper}
                            key={wallpaper}
                            onClick={() => setWallpaper(wallpaper)}
                            className="rounded hover:scale-103 transition aspect-5/3 hover:cursor-pointer" />
                    ))}
                </div>
            </div>

        </div>
    )
}
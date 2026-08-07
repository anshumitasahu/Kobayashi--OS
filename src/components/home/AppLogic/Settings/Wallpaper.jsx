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
        <div className="overflow-scroll h-full p-4 bg-white rounded-md">
            <div className="mb-3">
                <h2 className="mb-4 text-xs text-black">
                    Wallpaper
                </h2>
                <div className="grid grid-cols-2 gap-4">
                    {wallpapers.map((wallpaper) => (
                        <div className="aspect-video group overflow-hidden"
                            key={wallpaper}
                            onClick={() => setWallpaper(wallpaper)}
                        >
                            <img
                                src={wallpaper}
                                className="rounded group-hover:scale-110 transition object-cover hover:cursor-pointer w-full h-full" />
                        </div>
                    ))}
                </div>
            </div>

        </div>
    )
}
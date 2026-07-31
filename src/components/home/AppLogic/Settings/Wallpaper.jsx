import { useState, useEffect } from "react";
import { useAppStore } from "../../../../store";

export default function Wallpaper() {

    const setWallpaper = useAppStore((state) => state.setWallpaper);
    const IconStyle = useAppStore((state) => state.IconStyle)
    const setIconStyle = useAppStore((state) => state.setIconStyle);

    const wallpapers = [
        "bg2.png",
        "bg.png",
        "bg.jpeg",
        "bg-5.jpg",
        "bg-6.jpg",
        "bg-n.png",
        "bg-1.png",
        "bg-new.jpeg"
    ]

    const IconStyles = [
        "Colloid",
        "Deepin",
        "Fluent",
        "MacTahoe",
        "WhiteSur"
    ];

    return (
        <div className="overflow-scroll h-100 px-2 bg-white/70 rounded-md">
            <h1 className="text-md mt-2 mb-4 font-semibold">
                Appearance
            </h1>
            <div className="mb-4 border-b border-black/20 pb-5 border-dashed">
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
            <div className="mb-4">
                <h2 className="mb-3 mt-1 text-sm text-gray-600">
                    Icons Style
                </h2>
                <div className="grid grid-cols-5 gap-2">
                    {IconStyles.map((styles) => (

                        <button
                            key={styles}
                            onClick={() =>
                                setIconStyle(styles)
                            }
                            className="font-bold rounded-full text-white px-2 py-1"
                            style={{
                                backgroundColor: IconStyle === styles ? '#2563eb' : '#64748b'
                            }}
                        >
                            {styles}

                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}
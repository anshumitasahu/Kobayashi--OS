import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { useAppStore } from "../../../../store";

export default function Wallpaper() {
    const Images = [
        {
            id: 1,
            value: "bg3.jpg",
            type: "image"
        },
        {
            id: 2,
            value: "bg2.png",
            type: "image"
        },
        {
            id: 3,
            value: "bg1.jpg",
            type: "image"
        },
        {
            id: 4,
            value: "bg.png",
            type: "image"
        },
        {
            id: 5,
            value: "hero.jpg",
            type: "image"
        },
        {
            id: 6,
            value: "bg.jpeg",
            type: "image"
        },
        {
            id: 7,
            value: "bg-5.jpg",
            type: "image"
        },
        {
            id: 8,
            value: "bg-6.jpg",
            type: "image"
        },
    ]

    const colors = [
        "#09090B", "#121212", "#0F172A", "#0A192F", "#130E2E", "#062C23",
        "#FCE7F3", "#F3E8FF", "#E0F2FE", "#E6F4EA", "#FEF3C7", "#FFEDD5",
        "#6366F1", "#14B8A6", "#FF6B6B", "#F59E0B", "#84CC16"
    ];

    const gradients = [
        // 1. Sunset Horizon (Warm Orange to Magenta)
        "linear-gradient(135deg, #FF512F 0%, #DD2476 100%)",

        // 2. Ocean Breeze (Deep Teal to Bright Cyan)
        "linear-gradient(135deg, #00B4DB 0%, #0083B0 100%)",

        // 3. Neon Cyberpunk (Electric Purple to Vivid Pink)
        "linear-gradient(135deg, #F355DA 0%, #6E0DD0 100%)",

        // 4. Soft Pastel (Mint to Light Peach)
        "linear-gradient(135deg, #E0C3FC 0%, #8EC5FC 100%)",

        // 5. Lush Forest (Emerald Green to Lime Accent)
        "linear-gradient(135deg, #11998E 0%, #38EF7D 100%)",

        // 6. Midnight Sky (Navy to Soft Indigo)
        "linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)",

        // 7. Golden hour (Warm Amber to Soft Rose)
        "linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%)",

        // 8. Aurora Borealis (Dark Slate to Soft Cyan)
        "linear-gradient(135deg, #439CFB 0%, #F187FB 100%)"
    ];




    const setWallpaper = useAppStore((state) => state.setWallpaper);
    const setSolidColor = useAppStore((state) => state.setSolidColor);
    const setGradient = useAppStore((state) => state.setGradient);

    return (
        <div className="w-170 overflow-scroll">
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
                    {Images.map((image) => (
                        <img src={image.value} key={image.id} alt="" onClick={() => setWallpaper(image.value)} className="w-40 h-auto rounded hover:scale-103 transition" />

                    ))}
                </div>


                <div className="mt-2">
                    <h1>Choose Colour</h1>
                    <div className="flex flex-wrap gap-2">
                        {colors.map((color) => (
                            <button className="w-10 h-10 rounded-full" key={color} onClick={() => setSolidColor(color)} style={{ backgroundColor: color }} />
                        ))}
                    </div>
                </div>

                <div className="mt-2">
                    <h1>Choose Gradient</h1>
                    <div className="flex flex-wrap gap-2">
                        {gradients.map((gradient) => (
                            <button className="w-10 h-10 rounded-full" key={gradient} onClick={() => setGradient(gradient)} style={{ background: gradient }} />
                        ))}
                    </div>
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
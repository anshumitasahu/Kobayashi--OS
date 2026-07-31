import { useAppStore } from "../../../../store"

export default function Display() {

    const Brightness = useAppStore((state) => state.Brightness);
    const setBrightness = useAppStore((state) => state.setBrightness);
    const IconStyle = useAppStore((state) => state.IconStyle)
    const setIconStyle = useAppStore((state) => state.setIconStyle);

    const IconStyles = [
        "Colloid",
        "Deepin",
        "Fluent",
        "MacTahoe",
        "WhiteSur"
    ];

    return (
        <div className="bg-white max-h-100 min-h-100 overflow-scroll rounded p-3">
            <h1 className="text-sm mt-2 mb-4 font-semibold">
                Display
            </h1>
            <div className="border-b border-black/20 pb-4 mb-4">
                <h2 className="mb-3 mt-1 text-xs text-gray-600">
                    Brightness
                </h2>
                <div className="flex gap-2">
                    <input
                        type="range"
                        min="15"
                        max="100"
                        value={Brightness}
                        onChange={(e) => setBrightness(Number(e.target.value))}
                    />
                    <p className="text-gray-700">{Brightness}%</p>
                </div>
            </div>
            <div className="mb-4">
                <h2 className="mb-3 mt-1 text-xs text-gray-600">
                    Icons Style
                </h2>
                <div className="grid grid-cols-5 gap-2">
                    {IconStyles.map((styles) => (

                        <button
                            key={styles}
                            onClick={() =>
                                setIconStyle(styles)
                            }
                            className="font-bold rounded-full text-white px-2 py-1 hover:cursor-pointer hover:scale-103 transition"
                            style={{
                                backgroundColor: IconStyle === styles ? '#f699b4' : '#fbd38d'
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
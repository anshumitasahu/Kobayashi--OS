import { useAppStore } from "../../../../store"

export default function Display() {

    const Brightness = useAppStore((state) => state.Brightness);
    const setBrightness = useAppStore((state) => state.setBrightness);

    return (
        <div className="bg-white max-h-100 min-h-100 overflow-scroll rounded p-3">
            <h1 className="text-md mt-2 mb-4">
                Display
            </h1>
            <div className="border-b ">
                <h2 className="mb-3 mt-1 text-sm">
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
                    <p>{Brightness}%</p>
                </div>
            </div>
        </div>
    )
}
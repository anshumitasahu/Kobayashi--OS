import { useAppStore } from "../../../../store"
import ColloidBtns from "./IconBtns/ColloidBtns";
import DeepinBtns from "./IconBtns/DeepinBtns";
import FluentBtns from "./IconBtns/FluentBtns";
import MacTahoeBtns from "./IconBtns/MacTahoeBtns";
import WhiteSurBtns from "./IconBtns/WhiteSurBtns";

export default function Display() {

    const Brightness = useAppStore((state) => state.Brightness);
    const setBrightness = useAppStore((state) => state.setBrightness);
    const IconStyle = useAppStore((state) => state.IconStyle)
    const setIconStyle = useAppStore((state) => state.setIconStyle);

    const IconStyles = [
        {
            name: "Colloid",
            element: <ColloidBtns />
        },
        {
            name: "Deepin",
            element: <DeepinBtns />
        },
        {
            name: "Fluent",
            element: <FluentBtns />
        },
        {
            name: "MacTahoe",
            element: <MacTahoeBtns />
        },
        {
            name: "WhiteSur",
            element: <WhiteSurBtns />
        }
    ];

    return (
        <div className="bg-white h-full w-full overflow-scroll rounded p-3">
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
                            key={styles.name}
                            onClick={() =>
                                setIconStyle(styles.name)
                            }
                            className="font-bold rounded-md flex flex-col justify-center items-center text-white p-2 hover:cursor-pointer hover:scale-103 transition"
                            style={{
                                backgroundColor: IconStyle === styles.name ? '#fc6d96' : '#bd97f7'
                            }}
                        >
                            {styles.name}
                            {styles.element}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}
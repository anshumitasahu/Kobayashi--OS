import { div } from "motion/react-client";
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
            <div className="pb-4 mb-4">
                <h2 className="mb-6 mt-1 text-xs text-black">
                    Brightness
                </h2>
                <div className="flex gap-2">
                    <input
                        type="range"
                        min="15"
                        max="100"
                        value={Brightness}
                        onChange={(e) => setBrightness(Number(e.target.value))}
                        className="w-full bg-primary"
                    />
                    <p className="text-gray-700">{Brightness}%</p>
                </div>
            </div>
            <div className="mb-4">
                <h2 className="mb-6 mt-1 text-xs text-black">
                    Icons Style
                </h2>
                <div className="grid grid-cols-5 gap-2">
                    {IconStyles.map((styles) => (

                        <div className="flex flex-col text-[10px] gap-2 items-center text-slate-500">
                            <button
                                key={styles.name}
                                onClick={() =>
                                    setIconStyle(styles.name)
                                }
                                className="font-bold rounded-md flex flex-col justify-center items-center p-2 hover:cursor-pointer hover:scale-103 transition "
                                style={{
                                    backgroundColor: IconStyle === styles.name ? 'rgb(234, 220, 255)' : '#f2f2f2'
                                }}
                            >
                                {styles.element}
                            </button>
                            {styles.name}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
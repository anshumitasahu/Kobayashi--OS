import { MagnifyingGlassIcon, PaletteIcon } from "@phosphor-icons/react";
import { useAppStore } from "../../../../store";
import { SettingsIndex } from "../../../../lib/settingsStore/settingsIndex";

export default function SideBar() {
    // const openSetting = useAppStore((state) => state.openSetting);
    // const openedSettings = useAppStore((state) => state.openedSettings)
    return (
        <div className="w-fit">
            <div className="flex items-center gap-3 mt-1 mb-1 w-full bg-white rounded-md border border-black/10 px-2 py-1 text-xs">
                <button>
                    <MagnifyingGlassIcon size={18} color="black" />
                </button>
                <input type="text" placeholder="Search here" className="w-full outline-0" />
            </div>
            <div className="px-2 mt-3">
                {/* {SettingsIndex.map((Settings) => {
                    <div
                        key={Settings.id}
                        onClick={}
                    >
                        <div>
                            {Settings.icon}
                        </div>
                        <div>
                            {Settings.name}
                        </div>
                    </div>
                })} */}
                <div className="flex gap-3 items-center p-1 rounded-md">
                    <div className="bg-blue-500 p-2 rounded-md">
                        <PaletteIcon size={16} color="white" />
                    </div>
                    <div>
                        Appearance
                    </div>
                </div>
            </div>
        </div>
    )
}
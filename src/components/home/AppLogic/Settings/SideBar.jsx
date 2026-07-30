import { MagnifyingGlassIcon, PaletteIcon } from "@phosphor-icons/react";
import { useAppStore } from "../../../../store";
import { SettingsIndex } from "../../../../lib/settingsStore/settingsIndex";

export default function SideBar() {
    const openSetting = useAppStore((state) => state.openSetting);
    return (
        <div className="w-fit">
            <div className="flex items-center gap-3 mt-1 mb-1 w-full bg-white rounded-md border border-black/10 px-2 py-1 text-xs">
                <button>
                    <MagnifyingGlassIcon size={18} color="black" />
                </button>
                <input type="text" placeholder="Search here" className="w-full outline-0" />
            </div>
            <div className="px-2 mt-3">
                {SettingsIndex.map((setting) => (
                    <div
                        className="flex gap-3 items-center p-1 rounded-md"
                        key={setting.id}
                        onClick={() => openSetting(setting)}
                    >
                        <div
                            className="p-2 rounded-md"
                            style={{
                                backgroundColor: setting.color
                            }}
                        >
                            <setting.icon size={16} color="white" />
                        </div>
                        <div>{setting.name}</div>
                        <div></div>
                    </div>
                )
                )}
            </div>
        </div >
    )
}
import { MagnifyingGlassIcon, PaletteIcon } from "@phosphor-icons/react";
import { useAppStore } from "../../../../store";
import { SettingsIndex } from "../../../../lib/settingsStore/settingsIndex";
import { useEffect } from "react";

export default function SideBar() {
    const openSetting = useAppStore((state) => state.openSetting);
    const openedSetting = useAppStore((state) => state.openedSetting);

    return (
        <div className="w-full bg-white/50 p-1">
            <div className="flex items-center gap-3 mt-1 mb-1 w-full bg-white rounded-md border border-black/10 px-2 py-1 text-xs">
                <button>
                    <MagnifyingGlassIcon size={18} color="black" />
                </button>
                <input type="text" placeholder="Search here" className="w-full outline-0" />
            </div>
            <div className="mt-3">
                {SettingsIndex.map((setting) => (
                    <div
                        className="flex gap-3 items-center p-1 rounded-md"
                        key={setting.id}
                        onClick={() => openSetting(setting)}
                        style={{
                            backgroundColor: (openedSetting.id === setting.id) && "rgba(241, 226, 255, 0.8)"
                        }}
                    >
                        <div
                            className="p-1 rounded-md"
                            style={{
                                backgroundColor: setting.color
                            }}
                        >
                            <setting.icon size={16} color="white" weight="duotone" />
                        </div>
                        <div className="text-xs text-neutral-600">{setting.name}</div>
                    </div>
                )
                )}
            </div>
        </div >
    )
}
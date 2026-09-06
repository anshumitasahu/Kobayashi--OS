import { useAppStore } from "../../../store";
import SideBar from "./Settings/SideBar";
import { SettingsIndex } from "../../../lib/settingsStore/settingsIndex";

export default function Settings({ windowId }) {
    const settingId = useAppStore((state) => state.openedApps.find((app) => app.id === windowId)?.settingId);
    const openedSetting = SettingsIndex.find((setting) => setting.id === settingId) ?? SettingsIndex[0];
    return (
        <div className="grid grid-cols-[1fr_3fr] gap-2 h-full w-full overflow-scroll">
            <SideBar windowId={windowId} activeSettingId={openedSetting.id} />
            <div className="overflow-y-scroll">
                {openedSetting.setting}
            </div>
        </div>
    )
}
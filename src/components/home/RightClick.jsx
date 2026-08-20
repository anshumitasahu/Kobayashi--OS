import { useAppStore } from "../../store";
import { SettingsIndex } from "../../lib/settingsStore/settingsIndex";
import { AppsMenu } from "../../lib/apps";

export default function RightClick() {
    const toggleWidgetMenu = useAppStore((state) => state.toggleWidgetMenu);
    const openSetting = useAppStore((state) => state.openSetting);
    const openApp = useAppStore((state) => state.openApp);
    const IconStyle = useAppStore((state) => state.IconStyle);
    const openedApps = useAppStore((state) => state.openedApps)
    const bringToFront = useAppStore((state) => state.bringToFront)

    const settingsApp = AppsMenu(IconStyle).find(
        (app) => app.name === "Settings"
    );

    const openSettings = (setting) => {
        openSetting(setting);

        const existingSetting = openedApps.find((app) => app.name === "Settings")

        if (existingSetting) {
            bringToFront(existingSetting.id);
            return;
        }
        openApp(settingsApp);
    };

    return (
        <div className="bg-white w-fit rounded-sm">
            <ul className="text-neutral-600 text-sm cursor-default">

                <li
                    className="px-4 py-2 hover:bg-gray-100 rounded-sm"
                    onClick={toggleWidgetMenu}
                >
                    Change Widgets
                </li>

                <li
                    className="px-4 py-2 hover:bg-gray-100 rounded-sm"
                    onClick={() => openSettings(SettingsIndex[1])}
                >
                    Change Wallpaper
                </li>

                <li
                    className="px-4 py-2 hover:bg-gray-100 rounded-sm"
                    onClick={() => openSettings(SettingsIndex[0])}
                >
                    Change Icons
                </li>

            </ul>
        </div>
    );
}

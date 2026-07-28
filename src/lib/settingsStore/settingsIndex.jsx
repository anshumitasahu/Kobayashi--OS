import { PaletteIcon } from "@phosphor-icons/react";
import Wallpaper from "../../components/home/AppLogic/Settings/Wallpaper";

export const SettingsIndex = [
    {
        id: 1,
        name: "Appearance",
        description: "used for the customization of desktop",
        icon: PaletteIcon,
        setting: <Wallpaper />
    }
]
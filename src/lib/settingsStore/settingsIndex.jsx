import { PaletteIcon, UserIcon } from "@phosphor-icons/react";
import Wallpaper from "../../components/home/AppLogic/Settings/Wallpaper";
import AboutUs from "../../components/home/AppLogic/Settings/AboutUser";

export const SettingsIndex = [
    {
        id: 1,
        name: "Appearance",
        description: "used for the customization of desktop",
        icon: PaletteIcon,
        setting: <Wallpaper />,
        color: "pink-700"
    },
    {
        id: 2,
        name: "About Us",
        description: "used for the info of the owner of  the os",
        icon: UserIcon,
        setting: <AboutUs />,
        color: "blue-500"
    }
]
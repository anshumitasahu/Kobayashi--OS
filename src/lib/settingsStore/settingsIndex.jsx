import { PaletteIcon, UserIcon, MonitorIcon } from "@phosphor-icons/react";
import Wallpaper from "../../components/home/AppLogic/Settings/Wallpaper";
import AboutUs from "../../components/home/AppLogic/Settings/AboutUser";
import Display from "../../components/home/AppLogic/Settings/Display";

export const SettingsIndex = [
    {
        id: 1,
        name: "Appearance",
        description: "used for the customization of desktop",
        icon: PaletteIcon,
        setting: <Wallpaper />,
        color: "#EC4899"
    },
    {
        id: 2,
        name: "About Us",
        description: "used for the info of the owner of the os",
        icon: UserIcon,
        setting: <AboutUs />,
        color: "#10B981"
    },
    {
        id: 3,
        name: "Display",
        description: "used for the customization of display",
        icon: MonitorIcon,
        setting: <Display />,
        color: "#8B5CF6"
    }
];
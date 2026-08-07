import { PaletteIcon, UserIcon, MonitorIcon } from "@phosphor-icons/react";
import Wallpaper from "../../components/home/AppLogic/Settings/Wallpaper";
import AboutUs from "../../components/home/AppLogic/Settings/AboutUser";
import Display from "../../components/home/AppLogic/Settings/Display";

export const SettingsIndex = [
    {
        id: 1,
        name: "Display",
        description: "used for the customization of display",
        icon: MonitorIcon,
        setting: <Display />,
        color: "#A78BFA"
    },
    {
        id: 2,
        name: "Appearance",
        description: "used for the customization of desktop",
        icon: PaletteIcon,
        setting: <Wallpaper />,
        color: "#F472B6"
    },
    {
        id: 3,
        name: "About Us",
        description: "used for the info of the owner of the os",
        icon: UserIcon,
        setting: <AboutUs />,
        color: "#34D399"
    },
];
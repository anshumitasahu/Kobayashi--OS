import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { useAppStore } from "../../../store";
import Wallpaper from "./Settings/Wallpaper";
import SideBar from "./Settings/SideBar";

export default function Settings() {

    return (
        <div className="grid grid-cols-[1fr_3fr] gap-1 h-100 w-172 overflow-scroll">
            <SideBar />
            < Wallpaper />
        </div>
    )
}
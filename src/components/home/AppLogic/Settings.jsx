import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { useAppStore } from "../../../store";
import Wallpaper from "./Settings/Wallpaper";

export default function Settings() {

    return (
        <div className="h-100 w-176 overflow-scroll p-3">
            < Wallpaper />
        </div>
    )
}
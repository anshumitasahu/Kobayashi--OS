import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { useAppStore } from "../../../store";
import SideBar from "./Settings/SideBar";

export default function Settings() {
    const openedSetting = useAppStore((state) => state.openedSetting);
    return (
        <div className="grid grid-cols-[1fr_3fr] gap-1 h-100 w-172">
            <SideBar />
            <div>
                {openedSetting}
            </div>
        </div>
    )
}
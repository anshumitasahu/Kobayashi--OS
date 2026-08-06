import { useAppStore } from "../../../store";
import { AppsInMenu } from "../../../lib/menuApps/menuAppIndex";
import AppsBar from "../AppsBar";
import { useState } from "react";

export default function MenuApps({ openApp }) {
    const openedApps = useAppStore((state) => state.openedApps)
    const IconStyle = useAppStore((state) => state.IconStyle);
    const closeMenu = useAppStore((state) => state.closeMenu)
    const [search, setSearch] = useState("");
    const apps = AppsInMenu(IconStyle);

    return (
        <div className="bg-transparent backdrop-blur-lg w-screen h-screen" >
            <div className="flex flex-col gap-5 items-center mt-10">
                <div>
                    <input
                        type="text"
                        placeholder="Search Apps"
                        className="text-white font-bold bg-black/10 backdrop-blur-sm outline-0 border-white border rounded-xl px-4 py-2 mb-8"
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-5">
                    {
                        apps.filter((app) => {
                            return search.toLowerCase() === '' ? app : app.name.toLowerCase().includes(search);
                        }).map((app) => (
                            < div
                                key={app.id}
                                className="rounded-md hover:-translate-y-1 cursor-pointer"
                                onClick={() => {
                                    openApp(app);
                                    closeMenu()
                                }}
                            >
                                <div className="flex flex-col items-center">
                                    <img src={app.icon} className="w-16" />
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>
            <div>
                <AppsBar openApp={openApp} />
            </div>
        </div >
    )
}
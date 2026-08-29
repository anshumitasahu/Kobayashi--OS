import { useAppStore } from "../../../store";
import { AppsInMenu } from "../../../lib/menuApps/menuAppIndex";
import AppsBar from "../AppsBar";
import { useState } from "react";

export default function MenuApps({ openApp }) {
    const openedApps = useAppStore((state) => state.openedApps)
    const IconStyle = useAppStore((state) => state.IconStyle);
    const closeMenu = useAppStore((state) => state.closeMenu)
    const [search, setSearch] = useState("");
    const restore = useAppStore((state) => state.restore);
    const maximized = openedApps.find((app) => app.windowState === "maximized");
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
                <div className="grid grid-cols-10 gap-5">
                    {
                        apps.filter((app) => {
                            return search.toLowerCase() === '' ? app : app.name.toLowerCase().includes(search);
                        }).map((app) => {
                            const minimized = openedApps.find((property) => property.name === app.name && property.windowState === "minimized")
                            const maximized = openedApps.find((property) => property.name === app.name && property.windowState === "maximized");
                            return (
                                < div
                                    key={app.id}
                                    className="rounded-md hover:-translate-y-0.5 cursor-pointer"
                                    style={{
                                        transition: "all 0.3s"
                                    }}
                                    onClick={() => {
                                        const existing = openedApps.find((property) => property.name === app.name && property.windowState !== "normal");
                                        if (existing) {
                                            restore(existing.id);
                                            closeMenu()
                                        } else {
                                            openApp(app);
                                            closeMenu()
                                        }
                                    }}
                                >
                                    <div className="flex flex-col items-center">
                                        <img src={app.icon} className="w-16 rounded-xl" />
                                        {minimized && (
                                            <div className="w-1 h-1 bg-amber-400 rounded-full"></div>
                                        )}
                                        {maximized && (
                                            <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                                        )}
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
            <div>
                <AppsBar
                    openApp={openApp}
                />
            </div>
        </div >
    )
}
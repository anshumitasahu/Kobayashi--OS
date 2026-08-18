import { useEffect, useState } from "react";
import { AppsMenu } from "../../lib/apps";
import { useAppStore } from "../../store";
import { div, style } from "motion/react-client";

export default function AppsBar({ openApp }) {

    const openedApps = useAppStore((state) => state.openedApps)
    const IconStyle = useAppStore((state) => state.IconStyle);
    const restore = useAppStore((state) => state.restore);
    const isMenuOpen = useAppStore((state) => state.isMenuOpen)
    const openMenu = useAppStore((state) => state.openMenu);
    const closeMenu = useAppStore((state) => state.closeMenu)
    const toggleMenu = useAppStore((state) => state.toggleMenu);
    const toggleWidgetMenu = useAppStore((state) => state.toggleWidgetMenu)

    const maximized = openedApps.find((app) => app.windowState === "maximized");
    const apps = AppsMenu(IconStyle);

    const [isMouseOver, setIsMouseOver] = useState(false)

    return (
        <div
            className="w-full flex justify-center items-center absolute bottom-0 z-1000"
            style={{
                height: maximized ? (isMouseOver ? "90px" : "5px") : "90px",
                overflow: "hidden",
                transition: "height 0.2s ease"
            }}
            onMouseEnter={() => {
                if (maximized) {
                    setIsMouseOver(true);
                }
            }}
            onMouseLeave={() => {
                setIsMouseOver(false);
            }}
        >
            <div
                className="flex justify-center items-center gap-5 w-fit h-23 bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-white"
            >
                <div
                    className="cursor-pointer"
                    onClick={() => {
                        toggleMenu()
                    }}
                >
                    <img
                        src="/logo.svg"
                        className="w-12 bg-white p-2 rounded-xl hover:-translate-y-1"
                        style={{
                            transition: "all 0.1s"
                        }}
                    />
                </div>
                {
                    apps.map((app) => {
                        const minimized = openedApps.find((property) => property.name === app.name && property.windowState === "minimized")
                        const maximized = openedApps.find((property) => property.name === app.name && property.windowState === "maximized")
                        return (
                            <div
                                key={app.id}
                                className="rounded-md hover:-translate-y-1 cursor-pointer"
                                style={{
                                    transition: "all 0.3s"
                                }}
                                onClick={() => {
                                    const existing = openedApps.find((property) => property.name === app.name && property.windowState !== "normal");
                                    if (existing) {
                                        restore(existing.id);
                                    } else {
                                        openApp(app);
                                    }
                                }}
                            >
                                <div
                                    className="flex flex-col items-center"
                                >
                                    <img
                                        src={app.icon}
                                        className="w-12"
                                    />
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
                {openedApps.filter((app) => {
                    const existingApp = apps.find((exist) => exist.name === app.name);
                    return !existingApp;
                }).map((app) => (
                    <div key={app.id}>
                        <div
                            className="rounded-md hover:-translate-y-1 cursor-pointer"
                            style={{
                                transition: "all 0.3s"
                            }}
                            onClick={() => {
                                restore(app.id)
                            }}
                        >
                            <div className="flex flex-col items-center">
                                <img
                                    src={app.icon}
                                    className="w-12"
                                />

                                {app.windowState === "minimized" && (
                                    <div className="w-1 h-1 bg-amber-400 rounded-full" />
                                )}

                                {app.windowState === "maximized" && (
                                    <div className="w-1 h-1 bg-green-400 rounded-full" />
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                <div>
                    <img src="./LogoDevDock.png" alt="" className="w-12 rounded-3xl" onClick={toggleWidgetMenu} />
                </div>
            </div>
        </div >
    );
}
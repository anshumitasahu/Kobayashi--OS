import { div } from "motion/react-client";
import { AppsMenu } from "../../lib/apps";
import { useAppStore } from "../../store";

export default function AppsBar({ openApp }) {

    const openedApps = useAppStore((state) => state.openedApps)
    const IconStyle = useAppStore((state) => state.IconStyle);
    const restore = useAppStore((state) => state.restore);
    const apps = AppsMenu(IconStyle);

    return (
        <div className="w-full flex justify-center items-center absolute bottom-0 z-1000">
            <div className="flex justify-center items-center gap-5 w-fit bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-white">
                <div
                    className="cursor-pointer"
                    onClick={() => alert("menu not implememnted")}
                >
                    <img src="/logo.svg" className="w-12 bg-white p-2 rounded-xl hover:-translate-y-1" />
                </div>
                {
                    apps.map((app) => {
                        const minimized = openedApps.find((property) => property.name === app.name && property.windowState === "minimized")
                        return (
                            < div
                                key={app.id}
                                className="rounded-md hover:-translate-y-1 cursor-pointer"
                                onClick={() => {
                                    const existing = openedApps.find((property) => property.name === app.name && property.windowState === "minimized");
                                    if (existing) {
                                        restore(existing.id);
                                    } else {
                                        openApp(app);
                                    }
                                }}
                            >
                                <div className="flex flex-col items-center">
                                    {minimized && (
                                        <div className="w-1 h-1 bg-primary rounded-full"></div>
                                    )}
                                    <img src={app.icon} className="w-13" />
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        </div >
    );
}
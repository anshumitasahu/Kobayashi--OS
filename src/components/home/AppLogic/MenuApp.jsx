import { useAppStore } from "../../../store";
import { AppsInMenu } from "../../../lib/menuApps/menuAppIndex";
import AppsBar from "../AppsBar";

export default function MenuApps({ openApp }) {
    const openedApps = useAppStore((state) => state.openedApps)
    const IconStyle = useAppStore((state) => state.IconStyle);
    // const restore = useAppStore((state) => state.restore);
    const closeMenu = useAppStore((state) => state.closeMenu)
    const apps = AppsInMenu(IconStyle);
    return (
        <div className="bg-transparent backdrop-blur-lg w-screen h-screen" >
            <div className="flex justify-between items-center p-1">
                <div className="flex gap-5 items-center">
                    <img src="/logo.svg" className="w-7 bg-white p-1.5 rounded-sm " />
                    <div className="text-sm text-gray-500">MenuApp</div>
                </div>
                <button
                    onClick={closeMenu}
                    className="text-black"
                >
                    Back to Home
                </button>
            </div>
            <div className="flex flex-col gap-5 items-center">
                <div>
                    <input
                        type="text"
                        placeholder="Search Apps"
                        className="text-white font-bold bg-black/10 backdrop-blur-sm outline-0 border-white border rounded-xl px-4 py-2 mb-8"
                    />
                </div>
                <div className="flex gap-5">
                    {
                        apps.map((app) => {
                            return (
                                < div
                                    key={app.id}
                                    className="rounded-md hover:-translate-y-1 cursor-pointer"
                                    onClick={() => {
                                        openApp(app);
                                        closeMenu()
                                    }}
                                >
                                    <div className="flex flex-col items-center">
                                        <img src={app.icon} className="w-13" />
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
            <div>
                <AppsBar />
            </div>
        </div >
    )
}